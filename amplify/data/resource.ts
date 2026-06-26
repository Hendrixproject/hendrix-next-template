import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateSchema } from "../functions/generate-schema/resource";

/**
 * Hendrix admin data model.
 *
 * The admin lets you define models at runtime (the Schema Builder), so the
 * backend stores them generically rather than as a fixed schema:
 *   - AdminModel  — a model definition (name, label, fields) authored in the UI.
 *     `fields` is the FieldDefinition[] serialized as JSON.
 *   - AdminRecord — one row of data for a given model. `data` is the record's
 *     field values as JSON, keyed by the owning model's id.
 *
 * Auth: the admin is gated behind Cognito + the `admins` group, so we default
 * to userPool auth and scope every row with `owner()` — each admin sees only
 * their own models and records (real per-user persistence in DynamoDB).
 */
const schema = a.schema({
  AdminModel: a
    .model({
      name: a.string().required(),
      label: a.string().required(),
      pluralLabel: a.string().required(),
      description: a.string(),
      icon: a.string(),
      displayField: a.string(),
      orderBy: a.string(),
      // FieldDefinition[] serialized as JSON (dynamic, user-defined shape).
      fields: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),

  AdminRecord: a
    .model({
      // Foreign key to AdminModel.id (string match; not a hard relation so the
      // generic store stays simple). Indexed for per-model listing.
      modelId: a.string().required(),
      // Record field values as JSON, validated client-side against the model.
      data: a.json().required(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [index("modelId")]),

  // Schema-from-prompt: NL app description -> proposed model definitions (JSON
  // string). Restricted to the admins group; the Lambda calls Claude on Bedrock.
  // Returns a proposal only — the client previews and persists AdminModel rows.
  generateSchema: a
    .mutation()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.group("admins")])
    .handler(a.handler.function(generateSchema)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
