import type { FieldDefinition, FieldType, ModelDefinition } from "./types";

/**
 * Promote-to-production codegen (issue #9).
 *
 * Turns a dynamically-created ModelDefinition into a copy-paste Amplify Gen 2
 * model definition for `amplify/data/resource.ts`, so a prototype model can
 * graduate to a typed, indexed, production-grade table.
 *
 * Pure and dependency-free so it's trivially unit-testable.
 */

/** Map an admin FieldType to its Amplify `a.*()` schema builder call. */
function builderFor(field: FieldDefinition): string {
  const map: Record<FieldType, string> = {
    string: "a.string()",
    text: "a.string()", // long text is still a string column
    email: "a.string()",
    url: "a.string()",
    number: "a.float()", // see note: ints can be narrowed to a.integer()
    boolean: "a.boolean()",
    date: "a.date()",
    datetime: "a.datetime()",
    json: "a.json()",
    // Relations need a target model; emit a placeholder the dev must wire up.
    relation: "a.string()",
  };
  let expr = map[field.type] ?? "a.string()";
  if (field.required) expr += ".required()";
  return expr;
}

/** Convert a label/name to a valid PascalCase model type name. */
export function toModelName(model: ModelDefinition): string {
  const base = model.name || model.label || "Model";
  return base
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/** Fields worth suggesting as secondary indexes (commonly filtered/sorted). */
function indexCandidates(model: ModelDefinition): string[] {
  return model.fields
    .filter((f) => ["string", "email", "date", "datetime", "number"].includes(f.type))
    .map((f) => f.name)
    .slice(0, 2); // keep the suggestion modest
}

export interface PromotionResult {
  modelName: string;
  code: string;
  notes: string[];
}

/**
 * Generate the `resource.ts` snippet plus developer guidance for a model.
 */
export function generateResourceSnippet(model: ModelDefinition): PromotionResult {
  const modelName = toModelName(model);
  const fields = model.fields.filter((f) => f.name);

  const fieldLines = fields
    .map((f) => `      ${f.name}: ${builderFor(f)},`)
    .join("\n");

  const indexes = indexCandidates(model);
  const indexLine =
    indexes.length > 0
      ? `\n    .secondaryIndexes((index) => [${indexes
          .map((n) => `index("${n}")`)
          .join(", ")}])`
      : "";

  const code = `${modelName}: a
    .model({
${fieldLines || "      // add fields"}
    })
    .authorization((allow) => [allow.owner()])${indexLine},`;

  const notes: string[] = [
    "Paste this inside the `a.schema({ ... })` block in amplify/data/resource.ts, then deploy (ampx sandbox / git push).",
    "Owner auth is applied so each user sees only their own rows — matching the dynamic admin's behavior.",
  ];
  if (fields.some((f) => f.type === "number")) {
    notes.push(
      "Number fields default to a.float(). Use a.integer() for whole-number fields.",
    );
  }
  if (fields.some((f) => f.type === "relation")) {
    notes.push(
      "Relation fields were emitted as a.string() placeholders — wire real relationships with a.belongsTo()/a.hasMany() and a related model.",
    );
  }
  if (indexes.length > 0) {
    notes.push(
      `Suggested secondary index(es) on: ${indexes.join(", ")} — enables fast DB queries/sorts (the dynamic tier filters in memory).`,
    );
  }
  notes.push(
    "Existing records in the dynamic store are NOT migrated automatically — move data into the new table separately if needed.",
  );

  return { modelName, code, notes };
}
