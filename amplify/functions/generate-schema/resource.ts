import { defineFunction } from "@aws-amplify/backend";

/**
 * Schema-from-prompt: turns a natural-language app description into admin model
 * definitions via Claude on Bedrock. Invoked through the `generateSchema`
 * custom mutation (admins only). Bedrock IAM is granted in backend.ts; the model
 * is the in-region EU inference profile for data residency.
 */
export const generateSchema = defineFunction({
  name: "generate-schema",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  environment: {
    // EU inference profile — keeps inference in-region (eu-west-3 / EU).
    BEDROCK_MODEL_ID: "eu.anthropic.claude-sonnet-4-5-20250929-v1:0",
  },
});
