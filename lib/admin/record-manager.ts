import { ModelRecord, RecordData } from "./types";
import { schemaManager } from "./schema-manager";

/**
 * Record Manager - Handles CRUD operations for model records
 * In production, this would use a real database
 */
class RecordManager {
  private records: Map<string, ModelRecord[]> = new Map();
  private storageKey = "admin_records";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const recordsArray = JSON.parse(stored);
          recordsArray.forEach(
            (item: { modelId: string; records: ModelRecord[] }) => {
              this.records.set(item.modelId, item.records);
            }
          );
        } catch (e) {
          console.error("Failed to load records from storage", e);
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const recordsArray = Array.from(this.records.entries()).map(
        ([modelId, records]) => ({
          modelId,
          records,
        })
      );
      localStorage.setItem(this.storageKey, JSON.stringify(recordsArray));
    }
  }

  createRecord(modelId: string, data: RecordData): ModelRecord {
    const model = schemaManager.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Validate data
    this.validateRecord(modelId, data);

    const record: ModelRecord = {
      id: this.generateId(),
      modelId,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const modelRecords = this.records.get(modelId) || [];
    modelRecords.push(record);
    this.records.set(modelId, modelRecords);
    this.saveToStorage();

    return record;
  }

  updateRecord(
    modelId: string,
    recordId: string,
    data: RecordData
  ): ModelRecord | null {
    const modelRecords = this.records.get(modelId);
    if (!modelRecords) return null;

    const recordIndex = modelRecords.findIndex((r) => r.id === recordId);
    if (recordIndex === -1) return null;

    // Validate data
    this.validateRecord(modelId, data);

    const updatedRecord: ModelRecord = {
      ...modelRecords[recordIndex],
      data: { ...modelRecords[recordIndex].data, ...data },
      updatedAt: new Date().toISOString(),
    };

    modelRecords[recordIndex] = updatedRecord;
    this.records.set(modelId, modelRecords);
    this.saveToStorage();

    return updatedRecord;
  }

  deleteRecord(modelId: string, recordId: string): boolean {
    const modelRecords = this.records.get(modelId);
    if (!modelRecords) return false;

    const filteredRecords = modelRecords.filter((r) => r.id !== recordId);
    if (filteredRecords.length === modelRecords.length) return false;

    this.records.set(modelId, filteredRecords);
    this.saveToStorage();
    return true;
  }

  getRecord(modelId: string, recordId: string): ModelRecord | null {
    const modelRecords = this.records.get(modelId);
    if (!modelRecords) return null;

    return modelRecords.find((r) => r.id === recordId) || null;
  }

  getRecords(
    modelId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      order?: "asc" | "desc";
      filter?: Record<string, any>;
    }
  ): { records: ModelRecord[]; total: number } {
    let modelRecords = this.records.get(modelId) || [];
    const total = modelRecords.length;

    // Apply filters
    if (options?.filter) {
      modelRecords = modelRecords.filter((record) => {
        return Object.entries(options.filter!).every(([key, value]) => {
          const recordValue = record.data[key];
          if (typeof value === "string" && typeof recordValue === "string") {
            return recordValue.toLowerCase().includes(value.toLowerCase());
          }
          return recordValue === value;
        });
      });
    }

    // Apply sorting
    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const order = options.order || "asc";
      modelRecords.sort((a, b) => {
        const aVal = a.data[orderBy];
        const bVal = b.data[orderBy];
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    if (options?.offset !== undefined) {
      modelRecords = modelRecords.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      modelRecords = modelRecords.slice(0, options.limit);
    }

    return { records: modelRecords, total };
  }

  bulkDelete(modelId: string, recordIds: string[]): number {
    const modelRecords = this.records.get(modelId);
    if (!modelRecords) return 0;

    const initialCount = modelRecords.length;
    const filteredRecords = modelRecords.filter(
      (r) => !recordIds.includes(r.id)
    );
    const deletedCount = initialCount - filteredRecords.length;

    if (deletedCount > 0) {
      this.records.set(modelId, filteredRecords);
      this.saveToStorage();
    }

    return deletedCount;
  }

  private validateRecord(modelId: string, data: RecordData): void {
    const model = schemaManager.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const errors: string[] = [];

    model.fields.forEach((field) => {
      const value = data[field.name];
      const validation = schemaManager.validateField(field, value);

      if (!validation.valid) {
        errors.push(validation.error!);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  private generateId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get statistics
  getModelStats(modelId: string): {
    totalRecords: number;
    lastUpdated: string | null;
  } {
    const records = this.records.get(modelId) || [];
    const lastUpdated =
      records.length > 0
        ? records.reduce(
            (latest, r) => (r.updatedAt > latest ? r.updatedAt : latest),
            records[0].updatedAt
          )
        : null;

    return {
      totalRecords: records.length,
      lastUpdated,
    };
  }
}

export const recordManager = new RecordManager();
