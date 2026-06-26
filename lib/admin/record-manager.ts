import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { ModelRecord, RecordData } from "./types";
import { schemaManager } from "./schema-manager";

/**
 * Record Manager — persists model records to the Amplify backend (AdminRecord
 * in DynamoDB), replacing localStorage. Records are listed by `modelId` via a
 * secondary index, then filtered/sorted/paginated client-side (data is JSON).
 *
 * Rows are owner-scoped by Amplify auth — each admin sees only their own data.
 */
const client = generateClient<Schema>();

function toRecord(row: Schema["AdminRecord"]["type"]): ModelRecord {
  return {
    id: row.id,
    modelId: row.modelId,
    data: (row.data as RecordData) ?? {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class RecordManager {
  async createRecord(modelId: string, data: RecordData): Promise<ModelRecord> {
    await this.validateRecord(modelId, data);
    const { data: row, errors } = await client.models.AdminRecord.create({
      modelId,
      data,
    });
    if (errors?.length || !row) {
      throw new Error(
        `Failed to create record: ${errors?.map((e) => e.message).join(", ") ?? "unknown"}`,
      );
    }
    return toRecord(row);
  }

  async updateRecord(
    modelId: string,
    recordId: string,
    data: RecordData,
  ): Promise<ModelRecord | null> {
    await this.validateRecord(modelId, data);
    const existing = await client.models.AdminRecord.get({ id: recordId });
    const merged = { ...((existing.data?.data as RecordData) ?? {}), ...data };
    const { data: row, errors } = await client.models.AdminRecord.update({
      id: recordId,
      data: merged,
    });
    if (errors?.length) {
      throw new Error(`Failed to update record: ${errors.map((e) => e.message).join(", ")}`);
    }
    return row ? toRecord(row) : null;
  }

  async deleteRecord(modelId: string, recordId: string): Promise<boolean> {
    const { errors } = await client.models.AdminRecord.delete({ id: recordId });
    if (errors?.length) {
      throw new Error(`Failed to delete record: ${errors.map((e) => e.message).join(", ")}`);
    }
    return true;
  }

  async getRecord(modelId: string, recordId: string): Promise<ModelRecord | null> {
    const { data } = await client.models.AdminRecord.get({ id: recordId });
    return data ? toRecord(data) : null;
  }

  /** List a model's records via the modelId index, then filter/sort/paginate. */
  async getRecords(
    modelId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      order?: "asc" | "desc";
      filter?: Record<string, unknown>;
    },
  ): Promise<{ records: ModelRecord[]; total: number }> {
    const { data, errors } = await client.models.AdminRecord.listAdminRecordByModelId(
      { modelId },
    );
    if (errors?.length) {
      throw new Error(`Failed to list records: ${errors.map((e) => e.message).join(", ")}`);
    }
    let records = (data ?? []).map(toRecord);
    const total = records.length;

    if (options?.filter) {
      records = records.filter((record) =>
        Object.entries(options.filter!).every(([key, value]) => {
          const rv = record.data[key];
          if (typeof value === "string" && typeof rv === "string") {
            return rv.toLowerCase().includes(value.toLowerCase());
          }
          return rv === value;
        }),
      );
    }

    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const dir = options.order === "desc" ? -1 : 1;
      records.sort((a, b) => {
        const av = a.data[orderBy];
        const bv = b.data[orderBy];
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    if (options?.offset !== undefined) records = records.slice(options.offset);
    if (options?.limit !== undefined) records = records.slice(0, options.limit);

    return { records, total };
  }

  async bulkDelete(modelId: string, recordIds: string[]): Promise<number> {
    const results = await Promise.all(
      recordIds.map((id) => client.models.AdminRecord.delete({ id })),
    );
    return results.filter((r) => !r.errors?.length).length;
  }

  async getModelStats(
    modelId: string,
  ): Promise<{ totalRecords: number; lastUpdated: string | null }> {
    const { records } = await this.getRecords(modelId);
    const lastUpdated =
      records.length > 0
        ? records.reduce(
            (latest, r) => (r.updatedAt > latest ? r.updatedAt : latest),
            records[0].updatedAt,
          )
        : null;
    return { totalRecords: records.length, lastUpdated };
  }

  private async validateRecord(modelId: string, data: RecordData): Promise<void> {
    const model = await schemaManager.getModel(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    const errors: string[] = [];
    model.fields.forEach((field) => {
      const result = schemaManager.validateField(field, data[field.name]);
      if (!result.valid) errors.push(result.error!);
    });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }
}

export const recordManager = new RecordManager();
