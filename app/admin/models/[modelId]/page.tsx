"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (modelId) {
      loadData();
    }
  }, [modelId]);

  const loadData = () => {
    const m = schemaManager.getModel(modelId);
    if (!m) {
      router.push("/admin");
      return;
    }
    setModel(m);

    const { records: r, total: t } = recordManager.getRecords(modelId);
    setRecords(r);
    setTotal(t);
  };

  const handleDelete = (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      recordManager.deleteRecord(modelId, recordId);
      loadData();
    }
  };

  const handleBulkDelete = () => {
    if (selectedRecords.size === 0) return;
    if (confirm(`Delete ${selectedRecords.size} selected records?`)) {
      recordManager.bulkDelete(modelId, Array.from(selectedRecords));
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
            <h1 className="text-3xl font-bold text-gray-900">
              {model.pluralLabel}
            </h1>
          </div>
          <p className="mt-2 text-gray-600">{model.description}</p>
        </div>
        <Link
          href={`/admin/models/${modelId}/create`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Add {model.label}
        </Link>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search records..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
      <div className="text-sm text-gray-600">
        Showing {filteredRecords.length} of {total} records
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
            <Link
              href={`/admin/models/${modelId}/create`}
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create First Record
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === records.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                {displayFields.map((field) => (
                  <th
                    key={field.name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={() => toggleSelect(record.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  {displayFields.map((field) => (
                    <td
                      key={field.name}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {field.type === "boolean" ? (
                        <span
                          className={
                            record.data[field.name]
                              ? "text-green-600"
                              : "text-gray-400"
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
                        className="text-indigo-600 hover:text-indigo-900"
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
