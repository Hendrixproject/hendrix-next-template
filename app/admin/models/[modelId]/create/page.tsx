"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";
import type {
  ModelDefinition,
  FieldDefinition,
  RecordData,
} from "@/lib/admin/types";

export default function CreateRecordPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params?.modelId as string;

  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [formData, setFormData] = useState<RecordData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (modelId) {
      const m = schemaManager.getModel(modelId);
      if (!m) {
        router.push("/admin");
        return;
      }
      setModel(m);

      // Initialize form data with defaults
      const initialData: RecordData = {};
      m.fields.forEach((field) => {
        if (field.default !== undefined) {
          initialData[field.name] = field.default;
        } else if (field.type === "boolean") {
          initialData[field.name] = false;
        }
      });
      setFormData(initialData);
    }
  }, [modelId]);

  const handleChange = (field: FieldDefinition, value: any) => {
    setFormData((prev) => ({ ...prev, [field.name]: value }));

    // Clear error for this field
    if (errors[field.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!model) return;

    // Validate all fields
    const newErrors: Record<string, string> = {};
    model.fields.forEach((field) => {
      const validation = schemaManager.validateField(
        field,
        formData[field.name]
      );
      if (!validation.valid) {
        newErrors[field.name] = validation.error!;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      recordManager.createRecord(modelId, formData);
      router.push(`/admin/models/${modelId}`);
    } catch (error) {
      alert("Error creating record: " + (error as Error).message);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.name];
    const error = errors[field.name];

    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
      error ? "border-red-500" : "border-gray-300"
    }`;

    switch (field.type) {
      case "text":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.helpText}
            rows={4}
            className={baseClasses}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) =>
              handleChange(
                field,
                e.target.value ? Number(e.target.value) : null
              )
            }
            placeholder={field.helpText}
            min={field.min}
            max={field.max}
            className={baseClasses}
          />
        );

      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field, e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              {field.helpText || "Yes/No"}
            </span>
          </label>
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            className={baseClasses}
          />
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            className={baseClasses}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.helpText}
            className={baseClasses}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.helpText}
            className={baseClasses}
          />
        );

      case "json":
        return (
          <textarea
            value={
              typeof value === "string" ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(field, parsed);
              } catch {
                handleChange(field, e.target.value);
              }
            }}
            placeholder={field.helpText || "{}"}
            rows={6}
            className={baseClasses + " font-mono text-sm"}
          />
        );

      default: // string
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.helpText}
            className={baseClasses}
          />
        );
    }
  };

  if (!model) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{model.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">
            Create {model.label}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
      >
        {model.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
            {field.helpText && !errors[field.name] && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
          </div>
        ))}

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create {model.label}
          </button>
        </div>
      </form>
    </div>
  );
}
