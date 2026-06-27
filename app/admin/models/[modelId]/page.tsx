"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";
import { generateResourceSnippet, type PromotionResult } from "@/lib/admin/codegen";
import { PromoteHint } from "@/components/admin/PrototypeTierNotice";
import type { ModelDefinition, ModelRecord } from "@/lib/admin/types";

export default function ModelListPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params?.modelId as string;

  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [records, setRecords] = useState<ModelRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [promotion, setPromotion] = useState<PromotionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (modelId) {
      loadData();
    }
  }, [modelId]);

  const loadData = async () => {
    const m = await schemaManager.getModel(modelId);
    if (!m) {
      router.push("/admin");
      return;
    }
    setModel(m);

    const { records: r, total: t } = await recordManager.getRecords(modelId);
    setRecords(r);
    setTotal(t);
  };

  const handleDelete = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      await recordManager.deleteRecord(modelId, recordId);
      loadData();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    if (confirm(`Delete ${selectedRecords.size} selected records?`)) {
      await recordManager.bulkDelete(modelId, Array.from(selectedRecords));
      setSelectedRecords(new Set());
      loadData();
    }
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map((r) => r.id)));
    }
  };

  const toggleSelect = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(record.data).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  if (!model) {
    return <div>Loading...</div>;
  }

  const displayFields = model.fields.slice(0, 4); // Show first 4 fields in table

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{model.icon}</span>
            <h1 className="text-3xl font-bold text-foreground">
              {model.pluralLabel}
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">{model.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCopied(false);
              setPromotion(generateResourceSnippet(model));
            }}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
            title="Generate a typed amplify/data/resource.ts model for production"
          >
            🚀 Promote to production
          </button>
          <Link
            href={`/admin/models/${modelId}/create`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            + Add {model.label}
          </Link>
        </div>
      </div>

      {/* Promote-to-production modal: typed resource.ts snippet + guidance */}
      {promotion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPromotion(null)}
        >
          <div
            className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Promote “{model.label}” to a typed model
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paste this into the <code>a.schema(&#123; … &#125;)</code> block in{" "}
                  <code>amplify/data/resource.ts</code>, then deploy. You get real
                  indexes, types and scale — see the notes below.
                </p>
              </div>
              <button
                onClick={() => setPromotion(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto text-foreground">
                <code>{promotion.code}</code>
              </pre>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(promotion.code);
                  setCopied(true);
                }}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {promotion.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <PromoteHint count={total} />

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search records..."
          className="flex-1 max-w-md px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        {selectedRecords.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete {selectedRecords.size} selected
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {total} records
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">No records found.</p>
            <Link
              href={`/admin/models/${modelId}/create`}
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Create First Record
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === records.length}
                    onChange={toggleSelectAll}
                    className="rounded border-input text-primary focus:ring-accent"
                  />
                </th>
                {displayFields.map((field) => (
                  <th
                    key={field.name}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={() => toggleSelect(record.id)}
                      className="rounded border-input text-primary focus:ring-accent"
                    />
                  </td>
                  {displayFields.map((field) => (
                    <td
                      key={field.name}
                      className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                    >
                      {field.type === "boolean" ? (
                        <span
                          className={
                            record.data[field.name]
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {record.data[field.name] ? "✓" : "✗"}
                        </span>
                      ) : field.type === "date" || field.type === "datetime" ? (
                        record.data[field.name] ? (
                          new Date(record.data[field.name]).toLocaleDateString()
                        ) : (
                          "-"
                        )
                      ) : (
                        String(record.data[field.name] || "-").slice(0, 50)
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/models/${modelId}/${record.id}`}
                        className="text-primary hover:text-primary"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/models/${modelId}/${record.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
