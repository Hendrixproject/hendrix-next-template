import { describe, it, expect, vi, beforeEach } from "vitest";

// Defined via vi.hoisted so they exist when the hoisted vi.mock factory runs.
const { adminRecord } = vi.hoisted(() => ({
  adminRecord: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    listAdminRecordByModelId: vi.fn(),
  },
}));

vi.mock("aws-amplify/data", () => ({
  generateClient: () => ({ models: { AdminRecord: adminRecord } }),
}));

// record-manager validates via schemaManager.getModel — stub it so validation
// always passes (manager validation is covered by validate-field.test.ts).
vi.mock("./schema-manager", () => ({
  schemaManager: {
    getModel: vi.fn().mockResolvedValue({
      id: "m1",
      name: "post",
      label: "Post",
      fields: [],
    }),
  },
}));

import { recordManager } from "./record-manager";

const rec = (id: string, data: Record<string, unknown>, updatedAt = "2026-01-01T00:00:00Z") => ({
  id,
  modelId: "m1",
  data,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt,
});

beforeEach(() => vi.clearAllMocks());

describe("recordManager.getRecords", () => {
  beforeEach(() => {
    adminRecord.listAdminRecordByModelId.mockResolvedValue({
      data: [
        rec("r1", { name: "Banana", qty: 3 }),
        rec("r2", { name: "apple", qty: 1 }),
        rec("r3", { name: "Cherry", qty: 2 }),
      ],
      errors: undefined,
    });
  });

  it("returns all records with total", async () => {
    const { records, total } = await recordManager.getRecords("m1");
    expect(total).toBe(3);
    expect(records).toHaveLength(3);
    expect(adminRecord.listAdminRecordByModelId).toHaveBeenCalledWith({ modelId: "m1" });
  });

  it("filters case-insensitively on string fields", async () => {
    const { records, total } = await recordManager.getRecords("m1", {
      filter: { name: "an" }, // matches "Banana"
    });
    expect(total).toBe(3); // total is pre-filter
    expect(records.map((r) => r.id)).toEqual(["r1"]);
  });

  it("sorts ascending and descending", async () => {
    const asc = await recordManager.getRecords("m1", { orderBy: "qty", order: "asc" });
    expect(asc.records.map((r) => r.data.qty)).toEqual([1, 2, 3]);
    const desc = await recordManager.getRecords("m1", { orderBy: "qty", order: "desc" });
    expect(desc.records.map((r) => r.data.qty)).toEqual([3, 2, 1]);
  });

  it("applies offset and limit", async () => {
    const { records } = await recordManager.getRecords("m1", {
      orderBy: "qty",
      order: "asc",
      offset: 1,
      limit: 1,
    });
    expect(records.map((r) => r.data.qty)).toEqual([2]);
  });

  it("throws on backend errors", async () => {
    adminRecord.listAdminRecordByModelId.mockResolvedValue({
      data: null,
      errors: [{ message: "nope" }],
    });
    await expect(recordManager.getRecords("m1")).rejects.toThrow(/nope/);
  });
});

describe("recordManager.updateRecord", () => {
  it("merges new values over the existing record data", async () => {
    adminRecord.get.mockResolvedValue({ data: rec("r1", { a: 1, b: 2 }) });
    adminRecord.update.mockResolvedValue({
      data: rec("r1", { a: 9, b: 2 }),
      errors: undefined,
    });

    await recordManager.updateRecord("m1", "r1", { a: 9 });

    const arg = adminRecord.update.mock.calls[0][0];
    expect(arg.data).toEqual({ a: 9, b: 2 }); // b preserved, a overwritten
  });
});

describe("recordManager.bulkDelete", () => {
  it("counts only successful deletes", async () => {
    adminRecord.delete
      .mockResolvedValueOnce({ errors: undefined })
      .mockResolvedValueOnce({ errors: [{ message: "fail" }] })
      .mockResolvedValueOnce({ errors: undefined });

    const count = await recordManager.bulkDelete("m1", ["r1", "r2", "r3"]);
    expect(count).toBe(2);
    expect(adminRecord.delete).toHaveBeenCalledTimes(3);
  });
});

describe("recordManager.getModelStats", () => {
  it("reports count and latest updatedAt", async () => {
    adminRecord.listAdminRecordByModelId.mockResolvedValue({
      data: [
        rec("r1", {}, "2026-01-01T00:00:00Z"),
        rec("r2", {}, "2026-03-05T00:00:00Z"),
        rec("r3", {}, "2026-02-01T00:00:00Z"),
      ],
      errors: undefined,
    });
    const stats = await recordManager.getModelStats("m1");
    expect(stats.totalRecords).toBe(3);
    expect(stats.lastUpdated).toBe("2026-03-05T00:00:00Z");
  });

  it("handles an empty model", async () => {
    adminRecord.listAdminRecordByModelId.mockResolvedValue({ data: [], errors: undefined });
    const stats = await recordManager.getModelStats("m1");
    expect(stats).toEqual({ totalRecords: 0, lastUpdated: null });
  });
});
