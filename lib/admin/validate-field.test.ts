import { describe, it, expect, vi } from "vitest";

// schema-manager calls generateClient() at module load; stub it so importing
// the module doesn't try to reach a real Amplify backend.
vi.mock("aws-amplify/data", () => ({
  generateClient: () => ({ models: {} }),
}));

import { schemaManager } from "./schema-manager";
import type { FieldDefinition } from "./types";

const field = (over: Partial<FieldDefinition>): FieldDefinition => ({
  name: "f",
  label: "Field",
  type: "string",
  ...over,
});

describe("schemaManager.validateField", () => {
  it("flags missing required values", () => {
    const f = field({ required: true, label: "Title" });
    for (const empty of [null, undefined, ""]) {
      const r = schemaManager.validateField(f, empty);
      expect(r.valid).toBe(false);
      expect(r.error).toBe("Title is required");
    }
  });

  it("allows empty values when not required", () => {
    expect(schemaManager.validateField(field({}), "").valid).toBe(true);
    expect(schemaManager.validateField(field({}), undefined).valid).toBe(true);
  });

  it("validates email format", () => {
    const f = field({ type: "email" });
    expect(schemaManager.validateField(f, "a@b.com").valid).toBe(true);
    expect(schemaManager.validateField(f, "not-an-email").valid).toBe(false);
    expect(schemaManager.validateField(f, "not-an-email").error).toMatch(/email/i);
  });

  it("validates url format", () => {
    const f = field({ type: "url" });
    expect(schemaManager.validateField(f, "https://x.com").valid).toBe(true);
    expect(schemaManager.validateField(f, "nope").valid).toBe(false);
  });

  it("enforces number min/max", () => {
    const f = field({ type: "number", min: 1, max: 5 });
    expect(schemaManager.validateField(f, 3).valid).toBe(true);
    expect(schemaManager.validateField(f, 0).valid).toBe(false);
    expect(schemaManager.validateField(f, 9).valid).toBe(false);
  });

  it("does not flag a number field with no value", () => {
    // optional number, no min/max breach because there's no value
    expect(schemaManager.validateField(field({ type: "number" }), undefined).valid).toBe(
      true,
    );
  });

  it("enforces a regex pattern", () => {
    const f = field({ pattern: "^[a-z]+$" });
    expect(schemaManager.validateField(f, "abc").valid).toBe(true);
    expect(schemaManager.validateField(f, "ABC123").valid).toBe(false);
  });

  it("passes a valid plain string", () => {
    expect(schemaManager.validateField(field({}), "hello").valid).toBe(true);
  });
});
