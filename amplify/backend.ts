import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { generateSchema } from "./functions/generate-schema/resource";

const backend = defineBackend({
  auth,
  data,
  generateSchema,
});

// Allow the schema generator to invoke Claude via the EU Bedrock inference
// profile (in-region — EU data residency). Scoped to Anthropic foundation models
// and the EU inference profile, not "*", per least privilege. The inference
// profile fans out to regional model ARNs, so both must be allowed.
backend.generateSchema.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      "arn:aws:bedrock:*::foundation-model/anthropic.*",
      "arn:aws:bedrock:*:*:inference-profile/eu.anthropic.*",
    ],
  }),
);
