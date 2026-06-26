"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { schemaManager } from "@/lib/admin/schema-manager";
import { client } from "@/lib/client";
import type { FieldDefinition, FieldType } from "@/lib/admin/types";

/** A model proposed by the AI, before the user confirms creation. */
interface ProposedModel {
  name: string;
  label: string;
  pluralLabel: string;
  description?: string;
  icon?: string;
  displayField?: string;
  fields: FieldDefinition[];
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "string", label: "Text (Short)" },
  { value: "text", label: "Text (Long)" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean (Yes/No)" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & Time" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "json", label: "JSON" },
];

const ICONS = [
  "📄",
  "📝",
  "📋",
  "📊",
  "👤",
  "🏢",
  "💼",
  "🎯",
  "🔖",
  "📦",
  "🎨",
  "⚙️",
];

export default function SchemaBuilder() {
  const router = useRouter();
  const [modelName, setModelName] = useState("");
  const [modelLabel, setModelLabel] = useState("");
  const [pluralLabel, setPluralLabel] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📄");
  const [fields, setFields] = useState<FieldDefinition[]>([
    {
      name: "name",
      type: "string",
      label: "Name",
      required: true,
    },
  ]);

  // --- AI schema-from-prompt ---
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [proposed, setProposed] = useState<ProposedModel[] | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    setProposed(null);
    try {
      const { data, errors } = await client.mutations.generateSchema({
        prompt: aiPrompt,
      });
      if (errors?.length || !data) {
        throw new Error(errors?.map((e) => e.message).join(", ") ?? "No response");
      }
      setProposed(JSON.parse(data) as ProposedModel[]);
    } catch (error) {
      alert("Generation failed: " + (error as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!proposed) return;
    setAiBusy(true);
    try {
      let firstId = "";
      for (const m of proposed) {
        const created = await schemaManager.createModel({
          name: m.name.toLowerCase().replace(/\s+/g, "_"),
          label: m.label,
          pluralLabel: m.pluralLabel || m.label + "s",
          description: m.description,
          icon: m.icon,
          fields: m.fields,
          displayField: m.displayField || m.fields[0]?.name || "name",
        });
        if (!firstId) firstId = created.id;
      }
      router.push(proposed.length === 1 ? `/admin/models/${firstId}` : "/admin");
    } catch (error) {
      alert("Error creating models: " + (error as Error).message);
      setAiBusy(false);
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        type: "string",
        label: "",
        required: false,
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const model = await schemaManager.createModel({
        name: modelName.toLowerCase().replace(/\s+/g, "_"),
        label: modelLabel,
        pluralLabel: pluralLabel || modelLabel + "s",
        description,
        icon: selectedIcon,
        fields: fields.filter((f) => f.name && f.label),
        displayField: "name",
      });

      router.push(`/admin/models/${model.id}`);
    } catch (error) {
      alert("Error creating model: " + (error as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Schema Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new model with custom fields
        </p>
      </div>

      {/* AI: schema from prompt */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            ✨ Generate from a prompt
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your app and let Claude propose the models. You can review
            and tweak before anything is created.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. a blog with posts and comments"
            className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerate();
            }}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={aiBusy || !aiPrompt.trim()}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
          >
            {aiBusy ? "Thinking…" : "Generate"}
          </button>
        </div>

        {proposed && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">
              Proposed {proposed.length} model{proposed.length > 1 ? "s" : ""}:
            </p>
            {proposed.map((m) => (
              <div
                key={m.name}
                className="rounded-lg border border-border p-4 bg-muted/40"
              >
                <div className="font-medium text-foreground">
                  {m.icon} {m.label}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({m.name})
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.fields.map((f) => (
                    <span
                      key={f.name}
                      className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted-foreground"
                    >
                      {f.name}: {f.type}
                      {f.required ? " *" : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAcceptProposal}
                disabled={aiBusy}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
              >
                {aiBusy ? "Creating…" : "Create these models"}
              </button>
              <button
                type="button"
                onClick={() => setProposed(null)}
                disabled={aiBusy}
                className="px-5 py-2 border border-border rounded-lg hover:bg-muted font-medium transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        — or build one manually —
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Basic Info */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Model Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Model Name *
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g., product, customer"
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Internal name (lowercase, no spaces)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Display Label *
              </label>
              <input
                type="text"
                value={modelLabel}
                onChange={(e) => setModelLabel(e.target.value)}
                placeholder="e.g., Product, Customer"
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Plural Label
              </label>
              <input
                type="text"
                value={pluralLabel}
                onChange={(e) => setPluralLabel(e.target.value)}
                placeholder="e.g., Products, Customers"
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                      selectedIcon === icon
                        ? "border-accent bg-primary/10"
                        : "border-border hover:border-input"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this model is for..."
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Fields */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Field Name *
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, {
                          name: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_"),
                        })
                      }
                      placeholder="field_name"
                      className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Display Label *
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      placeholder="Field Label"
                      className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Field Type *
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value as FieldType,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-accent"
                    />
                    <span className="text-foreground">Required</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.unique || false}
                      onChange={(e) =>
                        updateField(index, { unique: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-accent"
                    />
                    <span className="text-foreground">Unique</span>
                  </label>

                  {field.type === "number" && (
                    <>
                      <input
                        type="number"
                        placeholder="Min"
                        value={field.min || ""}
                        onChange={(e) =>
                          updateField(index, {
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-20 px-2 py-1 text-sm border border-input rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={field.max || ""}
                        onChange={(e) =>
                          updateField(index, {
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-20 px-2 py-1 text-sm border border-input rounded"
                      />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="ml-auto text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {field.helpText !== undefined && (
                  <input
                    type="text"
                    value={field.helpText}
                    onChange={(e) =>
                      updateField(index, { helpText: e.target.value })
                    }
                    placeholder="Help text (optional)"
                    className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-input rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Create Model
          </button>
        </div>
      </form>
    </div>
  );
}
