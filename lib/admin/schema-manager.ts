import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { ModelDefinition, FieldDefinition } from "./types";

/**
 * Schema Manager — persists dynamic model definitions to the Amplify backend
 * (AdminModel in DynamoDB), replacing the previous localStorage store. Methods
 * that touch storage are async; validateField stays sync (pure).
 *
 * Rows are owner-scoped by Amplify auth, so each signed-in admin only ever
 * sees their own models.
 */
const client = generateClient<Schema>();

/** Map a DynamoDB AdminModel row into the UI's ModelDefinition shape. */
function toModel(row: Schema["AdminModel"]["type"]): ModelDefinition {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    pluralLabel: row.pluralLabel,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    displayField: row.displayField ?? undefined,
    orderBy: row.orderBy ?? undefined,
    fields: (row.fields as FieldDefinition[]) ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class SchemaManager {
  async createModel(
    model: Omit<ModelDefinition, "id" | "createdAt" | "updatedAt">,
  ): Promise<ModelDefinition> {
    const { data, errors } = await client.models.AdminModel.create({
      name: model.name,
      label: model.label,
      pluralLabel: model.pluralLabel,
      description: model.description,
      icon: model.icon,
      displayField: model.displayField,
      orderBy: model.orderBy,
      fields: model.fields,
    });
    if (errors?.length || !data) {
      throw new Error(
        `Failed to create model: ${errors?.map((e) => e.message).join(", ") ?? "unknown"}`,
      );
    }
    return toModel(data);
  }

  async updateModel(
    id: string,
    updates: Partial<ModelDefinition>,
  ): Promise<ModelDefinition | null> {
    const { data, errors } = await client.models.AdminModel.update({
      id,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.label !== undefined && { label: updates.label }),
      ...(updates.pluralLabel !== undefined && {
        pluralLabel: updates.pluralLabel,
      }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.icon !== undefined && { icon: updates.icon }),
      ...(updates.displayField !== undefined && {
        displayField: updates.displayField,
      }),
      ...(updates.orderBy !== undefined && { orderBy: updates.orderBy }),
      ...(updates.fields !== undefined && { fields: updates.fields }),
    });
    if (errors?.length) {
      throw new Error(`Failed to update model: ${errors.map((e) => e.message).join(", ")}`);
    }
    return data ? toModel(data) : null;
  }

  async deleteModel(id: string): Promise<boolean> {
    const { errors } = await client.models.AdminModel.delete({ id });
    if (errors?.length) {
      throw new Error(`Failed to delete model: ${errors.map((e) => e.message).join(", ")}`);
    }
    return true;
  }

  async getModel(id: string): Promise<ModelDefinition | null> {
    const { data } = await client.models.AdminModel.get({ id });
    return data ? toModel(data) : null;
  }

  async getModelByName(name: string): Promise<ModelDefinition | null> {
    const all = await this.getAllModels();
    return all.find((m) => m.name === name) ?? null;
  }

  async getAllModels(): Promise<ModelDefinition[]> {
    const { data, errors } = await client.models.AdminModel.list();
    if (errors?.length) {
      throw new Error(`Failed to list models: ${errors.map((e) => e.message).join(", ")}`);
    }
    return (data ?? []).map(toModel);
  }

  async addField(
    modelId: string,
    field: FieldDefinition,
  ): Promise<ModelDefinition | null> {
    const model = await this.getModel(modelId);
    if (!model) return null;
    return this.updateModel(modelId, { fields: [...model.fields, field] });
  }

  async updateField(
    modelId: string,
    fieldName: string,
    updates: Partial<FieldDefinition>,
  ): Promise<ModelDefinition | null> {
    const model = await this.getModel(modelId);
    if (!model) return null;
    const fields = model.fields.map((f) =>
      f.name === fieldName ? { ...f, ...updates } : f,
    );
    return this.updateModel(modelId, { fields });
  }

  async deleteField(
    modelId: string,
    fieldName: string,
  ): Promise<ModelDefinition | null> {
    const model = await this.getModel(modelId);
    if (!model) return null;
    const fields = model.fields.filter((f) => f.name !== fieldName);
    return this.updateModel(modelId, { fields });
  }

  /** Pure, synchronous field validation (no storage access). */
  validateField(
    field: FieldDefinition,
    value: unknown,
  ): { valid: boolean; error?: string } {
    if (field.required && (value === null || value === undefined || value === "")) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return { valid: false, error: "Invalid email format" };
      }
    }

    if (field.type === "url" && value) {
      try {
        new URL(String(value));
      } catch {
        return { valid: false, error: "Invalid URL format" };
      }
    }

    if (field.type === "number" && value !== null && value !== undefined) {
      const num = Number(value);
      if (field.min !== undefined && num < field.min) {
        return { valid: false, error: `Value must be at least ${field.min}` };
      }
      if (field.max !== undefined && num > field.max) {
        return { valid: false, error: `Value must be at most ${field.max}` };
      }
    }

    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(String(value))) {
        return { valid: false, error: `Value doesn't match required pattern` };
      }
    }

    return { valid: true };
  }
}

export const schemaManager = new SchemaManager();
