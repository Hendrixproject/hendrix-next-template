"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";
import type { ModelDefinition } from "@/lib/admin/types";

export default function AdminDashboard() {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [stats, setStats] = useState<
    Record<string, { totalRecords: number; lastUpdated: string | null }>
  >({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allModels = schemaManager.getAllModels();
    setModels(allModels);

    const newStats: Record<string, any> = {};
    allModels.forEach((model) => {
      newStats[model.id] = recordManager.getModelStats(model.id);
    });
    setStats(newStats);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your application models and data
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Total Models</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {models.length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Total Records</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {Object.values(stats).reduce((sum, s) => sum + s.totalRecords, 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Quick Actions</div>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/schema"
              className="block text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Create New Model
            </Link>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Models</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {models.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                No models yet. Create your first model to get started.
              </p>
              <Link
                href="/admin/schema"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Model
              </Link>
            </div>
          ) : (
            models.map((model) => {
              const modelStats = stats[model.id] || {
                totalRecords: 0,
                lastUpdated: null,
              };
              return (
                <div key={model.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{model.icon || "📄"}</span>
                        <div>
                          <Link
                            href={`/admin/models/${model.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {model.label}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {model.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>{model.fields.length} fields</span>
                        <span>•</span>
                        <span>{modelStats.totalRecords} records</span>
                        {modelStats.lastUpdated && (
                          <>
                            <span>•</span>
                            <span>
                              Updated{" "}
                              {new Date(
                                modelStats.lastUpdated
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/models/${model.id}/create`}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        + Add Record
                      </Link>
                      <Link
                        href={`/admin/models/${model.id}`}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
