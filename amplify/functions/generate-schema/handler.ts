import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { Schema } from "../../data/resource";

/**
 * generateSchema custom-mutation handler.
 *
 * Input:  { prompt }  — a natural-language app description.
 * Output: JSON string of ModelDefinition-shaped objects (name/label/fields...).
 *
 * Claude is forced through a tool schema that mirrors the admin's FieldDefinition
 * types, so the result is structured and validated — never free text we parse by
 * hand. The frontend previews the result and only then persists AdminModel rows;
 * nothing is created in the backend here.
 */
const client = new BedrockRuntimeClient({});

const FIELD_TYPES = [
  "string",
  "text",
  "number",
  "boolean",
  "date",
  "datetime",
  "email",
  "url",
  "json",
] as const;

// Tool schema Claude must fill — mirrors lib/admin/types.ts FieldDefinition.
const PROPOSE_TOOL = {
  name: "propose_models",
  description: "Propose the data models for the described application.",
  input_schema: {
    type: "object",
    properties: {
      models: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "snake_case singular, e.g. blog_post" },
            label: { type: "string", description: "Human singular, e.g. Blog Post" },
            pluralLabel: { type: "string" },
            description: { type: "string" },
            icon: { type: "string", description: "A single emoji" },
            displayField: {
              type: "string",
              description: "field name used as the record's title",
            },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "snake_case" },
                  label: { type: "string" },
                  type: { type: "string", enum: FIELD_TYPES },
                  required: { type: "boolean" },
                },
                required: ["name", "label", "type"],
              },
            },
          },
          required: ["name", "label", "pluralLabel", "fields"],
        },
      },
    },
    required: ["models"],
  },
} as const;

export const handler: Schema["generateSchema"]["functionHandler"] = async (
  event,
) => {
  const prompt = event.arguments.prompt?.trim();
  if (!prompt) throw new Error("A prompt is required.");

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2000,
    tools: [PROPOSE_TOOL],
    tool_choice: { type: "tool", name: "propose_models" },
    messages: [
      {
        role: "user",
        content: `Design the data models for this application: "${prompt}".
Keep it focused: 1-5 models, each with 3-8 sensible fields. Use the most specific
field type available (email/url/date/number/boolean) rather than string. Pick a
fitting emoji icon and a sensible displayField for each model.`,
      },
    ],
  };

  const res = await client.send(
    new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );

  const payload = JSON.parse(new TextDecoder().decode(res.body));
  const toolUse = payload.content?.find(
    (c: { type: string }) => c.type === "tool_use",
  );
  if (!toolUse?.input?.models) {
    throw new Error("Model did not return a schema proposal.");
  }

  // Return as a JSON string; the frontend parses, previews, and lets the user
  // edit before persisting. We do not create anything here.
  return JSON.stringify(toolUse.input.models);
};
