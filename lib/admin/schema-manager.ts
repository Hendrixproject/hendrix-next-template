import { ModelDefinition, FieldDefinition } from "./types";

/**
 * Schema Manager - Handles dynamic model definitions
 * In a production app, this would persist to a database
 */
class SchemaManager {
  private models: Map<string, ModelDefinition> = new Map();
  private storageKey = "admin_models";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const models = JSON.parse(stored);
          models.forEach((model: ModelDefinition) => {
            this.models.set(model.id, model);
          });
        } catch (e) {
          console.error("Failed to load models from storage", e);
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const models = Array.from(this.models.values());
      localStorage.setItem(this.storageKey, JSON.stringify(models));
    }
  }

  createModel(
    model: Omit<ModelDefinition, "id" | "createdAt" | "updatedAt">
  ): ModelDefinition {
    const newModel: ModelDefinition = {
      ...model,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.models.set(newModel.id, newModel);
    this.saveToStorage();
    return newModel;
  }

  updateModel(
    id: string,
    updates: Partial<ModelDefinition>
  ): ModelDefinition | null {
    const model = this.models.get(id);
    if (!model) return null;

    const updatedModel = {
      ...model,
      ...updates,
      id: model.id, // Prevent ID change
      updatedAt: new Date().toISOString(),
    };

    this.models.set(id, updatedModel);
    this.saveToStorage();
    return updatedModel;
  }

  deleteModel(id: string): boolean {
    const deleted = this.models.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getModel(id: string): ModelDefinition | null {
    return this.models.get(id) || null;
  }

  getModelByName(name: string): ModelDefinition | null {
    return (
      Array.from(this.models.values()).find((m) => m.name === name) || null
    );
  }

  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  addField(modelId: string, field: FieldDefinition): ModelDefinition | null {
    const model = this.models.get(modelId);
    if (!model) return null;

    const updatedFields = [...model.fields, field];
    return this.updateModel(modelId, { fields: updatedFields });
  }

  updateField(
    modelId: string,
    fieldName: string,
    updates: Partial<FieldDefinition>
  ): ModelDefinition | null {
    const model = this.models.get(modelId);
    if (!model) return null;

    const updatedFields = model.fields.map((f) =>
      f.name === fieldName ? { ...f, ...updates } : f
    );

    return this.updateModel(modelId, { fields: updatedFields });
  }

  deleteField(modelId: string, fieldName: string): ModelDefinition | null {
    const model = this.models.get(modelId);
    if (!model) return null;

    const updatedFields = model.fields.filter((f) => f.name !== fieldName);
    return this.updateModel(modelId, { fields: updatedFields });
  }

  private generateId(): string {
    return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateField(
    field: FieldDefinition,
    value: any
  ): { valid: boolean; error?: string } {
    if (
      field.required &&
      (value === null || value === undefined || value === "")
    ) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: "Invalid email format" };
      }
    }

    if (field.type === "url" && value) {
      try {
        new URL(value);
      } catch {
        return { valid: false, error: "Invalid URL format" };
      }
    }

    if (field.type === "number" && value !== null && value !== undefined) {
      if (field.min !== undefined && value < field.min) {
        return { valid: false, error: `Value must be at least ${field.min}` };
      }
      if (field.max !== undefined && value > field.max) {
        return { valid: false, error: `Value must be at most ${field.max}` };
      }
    }

    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return { valid: false, error: `Value doesn't match required pattern` };
      }
    }

    return { valid: true };
  }
}

// Singleton instance
export const schemaManager = new SchemaManager();
