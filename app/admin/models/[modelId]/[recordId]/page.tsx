"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";
import type { ModelDefinition, ModelRecord } from "@/lib/admin/types";

export default function ViewRecordPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params?.modelId as string;
  const recordId = params?.recordId as string;

  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [record, setRecord] = useState<ModelRecord | null>(null);

  useEffect(() => {
    if (modelId && recordId) {
      const m = schemaManager.getModel(modelId);
      const r = recordManager.getRecord(modelId, recordId);

      if (!m || !r) {
        router.push("/admin");
        return;
      }

      setModel(m);
      setRecord(r);
    }
  }, [modelId, recordId]);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this record?")) {
      recordManager.deleteRecord(modelId, recordId);
      router.push(`/admin/models/${modelId}`);
    }
  };

  const formatValue = (field: any, value: any) => {
    if (value === null || value === undefined) return "-";

    switch (field.type) {
      case "boolean":
        return value ? "✓ Yes" : "✗ No";
      case "date":
        return new Date(value).toLocaleDateString();
      case "datetime":
        return new Date(value).toLocaleString();
      case "json":
        return (
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      case "url":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            {value}
          </a>
        );
      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-indigo-600 hover:underline"
          >
            {value}
          </a>
        );
      default:
        return String(value);
    }
  };

  if (!model || !record) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{model.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">
              {model.label} Details
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Created: {new Date(record.createdAt).toLocaleString()} • Updated:{" "}
            {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/models/${modelId}/${recordId}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Record Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <dl className="divide-y divide-gray-200">
          {model.fields.map((field) => (
            <div key={field.name} className="px-6 py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </dt>
              <dd className="text-sm text-gray-900 col-span-2">
                {formatValue(field, record.data[field.name])}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/models/${modelId}`}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to {model.pluralLabel}
        </Link>
      </div>
    </div>
  );
}
