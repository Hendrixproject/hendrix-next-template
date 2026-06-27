import { describe, it, expect } from "vitest";
import { generateResourceSnippet, toModelName } from "./codegen";
import type { ModelDefinition } from "./types";

const model = (over: Partial<ModelDefinition> = {}): ModelDefinition => ({
  id: "m1",
  name: "product",
  label: "Product",
  pluralLabel: "Products",
  fields: [
    { name: "name", label: "Name", type: "string", required: true },
    { name: "price", label: "Price", type: "number" },
  ],
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("toModelName", () => {
  it("PascalCases the model name", () => {
    expect(toModelName(model({ name: "blog_post" }))).toBe("BlogPost");
    expect(toModelName(model({ name: "product" }))).toBe("Product");
  });
  it("falls back to label, then a default", () => {
    expect(toModelName(model({ name: "", label: "Order Item" }))).toBe("OrderItem");
    expect(toModelName(model({ name: "", label: "" }))).toBe("Model");
  });
});

describe("generateResourceSnippet", () => {
  it("maps field types to the right a.*() builders", () => {
    const { code } = generateResourceSnippet(
      model({
        fields: [
          { name: "title", label: "T", type: "string", required: true },
          { name: "body", label: "B", type: "text" },
          { name: "count", label: "C", type: "number" },
          { name: "active", label: "A", type: "boolean" },
          { name: "due", label: "D", type: "date" },
          { name: "at", label: "At", type: "datetime" },
          { name: "meta", label: "M", type: "json" },
        ],
      }),
    );
    expect(code).toContain("title: a.string().required()");
    expect(code).toContain("body: a.string()"); // text -> string
    expect(code).toContain("count: a.float()");
    expect(code).toContain("active: a.boolean()");
    expect(code).toContain("due: a.date()");
    expect(code).toContain("at: a.datetime()");
    expect(code).toContain("meta: a.json()");
  });

  it("applies .required() only to required fields", () => {
    const { code } = generateResourceSnippet(model());
    expect(code).toContain("name: a.string().required()");
    expect(code).toContain("price: a.float(),"); // not required -> no .required()
    expect(code).not.toContain("price: a.float().required()");
  });

  it("emits owner authorization", () => {
    expect(generateResourceSnippet(model()).code).toContain(
      ".authorization((allow) => [allow.owner()])",
    );
  });

  it("uses the PascalCase model name as the schema key", () => {
    expect(generateResourceSnippet(model({ name: "blog_post" })).code).toMatch(
      /^BlogPost: a/,
    );
  });

  it("suggests secondary indexes for filterable fields", () => {
    const { code, notes } = generateResourceSnippet(model());
    expect(code).toContain(".secondaryIndexes((index) => [");
    expect(notes.some((n) => /index/i.test(n))).toBe(true);
  });

  it("always warns that existing data is not migrated", () => {
    const { notes } = generateResourceSnippet(model());
    expect(notes.some((n) => /not migrated/i.test(n))).toBe(true);
  });

  it("notes float-vs-integer when number fields exist", () => {
    const { notes } = generateResourceSnippet(model());
    expect(notes.some((n) => /a\.integer\(\)/.test(n))).toBe(true);
  });

  it("flags relation placeholders", () => {
    const { notes } = generateResourceSnippet(
      model({
        fields: [{ name: "author", label: "Author", type: "relation" }],
      }),
    );
    expect(notes.some((n) => /relation/i.test(n))).toBe(true);
  });

  it("ignores unnamed fields", () => {
    const { code } = generateResourceSnippet(
      model({
        fields: [
          { name: "ok", label: "Ok", type: "string" },
          { name: "", label: "blank", type: "string" },
        ],
      }),
    );
    expect(code).toContain("ok: a.string()");
    expect(code).not.toContain(": a.string(),\n      : a.string()");
  });
});
