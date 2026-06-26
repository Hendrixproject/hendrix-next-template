"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedAdminData, clearAdminData } from "@/lib/admin/seed";

export default function AdminSetup() {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    // Check if data exists
    if (typeof window !== "undefined") {
      const hasData = localStorage.getItem("admin_models");
      setSeeded(!!hasData);
    }
  }, []);

  const handleSeed = () => {
    seedAdminData();
    setSeeded(true);
    window.location.href = "/admin";
  };

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear all admin data? This cannot be undone."
      )
    ) {
      clearAdminData();
      setSeeded(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎨 Admin Interface Setup
          </h1>
          <p className="text-muted-foreground">
            Django-like admin panel for Next.js with full CRUD capabilities
          </p>
        </div>

        <div className="bg-primary/10 border border-accent/30 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold text-primary">✨ Features</h2>
          <ul className="space-y-2 text-sm text-primary">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Create models dynamically with custom fields</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Full CRUD operations (Create, Read, Update, Delete)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Multiple field types: text, number, boolean, date, email, URL,
                JSON
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Field validation (required, unique, min/max values)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Search, filter, and bulk operations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Responsive UI built with Tailwind CSS 4</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          {!seeded ? (
            <div className="space-y-3">
              <button
                onClick={handleSeed}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                🚀 Seed Example Data & Start
              </button>
              <p className="text-sm text-muted-foreground text-center">
                This will create 3 example models (Products, Customers, Blog
                Posts) with sample records
              </p>
              <div className="border-t border-border pt-3">
                <Link
                  href="/admin"
                  className="block w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium text-center transition-colors"
                >
                  Start with Empty Admin
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href="/admin"
                className="block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-center transition-colors"
              >
                Go to Admin Dashboard
              </Link>
              <button
                onClick={handleClear}
                className="w-full px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors"
              >
                Clear All Data
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 space-y-3">
          <h3 className="font-semibold text-foreground">📚 Quick Start</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Create a new model using the Schema Builder</li>
            <li>Define fields with types and validation rules</li>
            <li>Start adding records through the admin interface</li>
            <li>Manage your data with full CRUD operations</li>
          </ol>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">💡 Tech Stack</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-card border border-border rounded-full">
              Next.js 15
            </span>
            <span className="px-3 py-1 bg-card border border-border rounded-full">
              React 19
            </span>
            <span className="px-3 py-1 bg-card border border-border rounded-full">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-card border border-border rounded-full">
              Tailwind CSS 4
            </span>
            <span className="px-3 py-1 bg-card border border-border rounded-full">
              AWS Amplify
            </span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
          {" • "}
          <a
            href="/ADMIN_README.md"
            target="_blank"
            className="text-primary hover:underline"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
