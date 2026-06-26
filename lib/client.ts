"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * Shared, typed Amplify Data client for the frontend. Use for custom queries/
 * mutations (e.g. client.mutations.generateSchema). The admin's CRUD goes
 * through lib/admin/* managers, which create their own client instances.
 */
export const client = generateClient<Schema>();
