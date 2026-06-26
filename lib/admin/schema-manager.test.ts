import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable fakes for the Amplify data client's AdminModel methods.
// Defined via vi.hoisted so they exist when the hoisted vi.mock factory runs.
const { adminModel } = vi.hoisted(() => ({
  adminModel: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock("aws-amplify/data", () => ({
  generateClient: () => ({ models: { AdminModel: adminModel } }),
}));

import { schemaManager } from "./schema-manager";

const row = (over: Record<string, unknown> = {}) => ({
  id: "m1",
  name: "post",
  label: "Post",
  pluralLabel: "Posts",
  description: null,
  icon: null,
  displayField: null,
  orderBy: null,
  fields: [{ name: "title", label: "Title", type: "string" }],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

beforeEach(() => vi.clearAllMocks());

describe("schemaManager.createModel", () => {
  it("creates and maps the row to a ModelDefinition", async () => {
    adminModel.create.mockResolvedValue({ data: row(), errors: undefined });

    const model = await schemaManager.createModel({
      name: "post",
      label: "Post",
      pluralLabel: "Posts",
      fields: [{ name: "title", label: "Title", type: "string" }],
    });

    expect(adminModel.create).toHaveBeenCalledOnce();
    expect(model.id).toBe("m1");
    expect(model.fields).toHaveLength(1);
    // null DB columns become undefined in the UI shape
    expect(model.description).toBeUndefined();
  });

  it("throws when the backend returns errors", async () => {
    adminModel.create.mockResolvedValue({
      data: null,
      errors: [{ message: "denied" }],
    });
    await expect(
      schemaManager.createModel({
        name: "x",
        label: "X",
        pluralLabel: "Xs",
        fields: [],
      }),
    ).rejects.toThrow(/denied/);
  });
});

describe("schemaManager.getAllModels", () => {
  it("maps every returned row", async () => {
    adminModel.list.mockResolvedValue({
      data: [row(), row({ id: "m2", name: "tag" })],
      errors: undefined,
    });
    const models = await schemaManager.getAllModels();
    expect(models.map((m) => m.id)).toEqual(["m1", "m2"]);
  });

  it("throws on list errors", async () => {
    adminModel.list.mockResolvedValue({ data: null, errors: [{ message: "boom" }] });
    await expect(schemaManager.getAllModels()).rejects.toThrow(/boom/);
  });
});

describe("schemaManager.getModel", () => {
  it("returns null when not found", async () => {
    adminModel.get.mockResolvedValue({ data: null });
    expect(await schemaManager.getModel("nope")).toBeNull();
  });
});

describe("schemaManager.addField", () => {
  it("appends a field to the existing model", async () => {
    adminModel.get.mockResolvedValue({ data: row() });
    adminModel.update.mockResolvedValue({
      data: row({
        fields: [
          { name: "title", label: "Title", type: "string" },
          { name: "body", label: "Body", type: "text" },
        ],
      }),
      errors: undefined,
    });

    const updated = await schemaManager.addField("m1", {
      name: "body",
      label: "Body",
      type: "text",
    });

    // update called with the merged field list
    const arg = adminModel.update.mock.calls[0][0];
    expect(arg.fields).toHaveLength(2);
    expect(updated?.fields.map((f) => f.name)).toEqual(["title", "body"]);
  });

  it("returns null if the model does not exist", async () => {
    adminModel.get.mockResolvedValue({ data: null });
    expect(
      await schemaManager.addField("ghost", { name: "x", label: "X", type: "string" }),
    ).toBeNull();
    expect(adminModel.update).not.toHaveBeenCalled();
  });
});

describe("schemaManager.deleteModel", () => {
  it("returns true on success", async () => {
    adminModel.delete.mockResolvedValue({ errors: undefined });
    expect(await schemaManager.deleteModel("m1")).toBe(true);
  });
});
