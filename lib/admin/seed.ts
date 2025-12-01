"use client";

import { schemaManager } from "@/lib/admin/schema-manager";
import { recordManager } from "@/lib/admin/record-manager";

/**
 * Seed the admin system with example models and data
 * This is for demonstration purposes
 */
export function seedAdminData() {
  // Check if already seeded
  const existingModels = schemaManager.getAllModels();
  if (existingModels.length > 0) {
    console.log("Data already seeded");
    return;
  }

  // Create Product model
  const productModel = schemaManager.createModel({
    name: "product",
    label: "Product",
    pluralLabel: "Products",
    description: "Manage your product catalog",
    icon: "📦",
    fields: [
      { name: "name", type: "string", label: "Product Name", required: true },
      { name: "description", type: "text", label: "Description" },
      {
        name: "price",
        type: "number",
        label: "Price ($)",
        required: true,
        min: 0,
      },
      { name: "in_stock", type: "boolean", label: "In Stock", default: true },
      { name: "launch_date", type: "date", label: "Launch Date" },
      { name: "website", type: "url", label: "Product Website" },
    ],
    displayField: "name",
  });

  // Create Customer model
  const customerModel = schemaManager.createModel({
    name: "customer",
    label: "Customer",
    pluralLabel: "Customers",
    description: "Manage customer information",
    icon: "👤",
    fields: [
      { name: "name", type: "string", label: "Full Name", required: true },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        required: true,
        unique: true,
      },
      { name: "phone", type: "string", label: "Phone Number" },
      { name: "is_active", type: "boolean", label: "Active", default: true },
      {
        name: "joined_date",
        type: "date",
        label: "Joined Date",
        required: true,
      },
      { name: "notes", type: "text", label: "Notes" },
    ],
    displayField: "name",
  });

  // Create Blog Post model
  const blogModel = schemaManager.createModel({
    name: "blog_post",
    label: "Blog Post",
    pluralLabel: "Blog Posts",
    description: "Manage blog content",
    icon: "📝",
    fields: [
      { name: "title", type: "string", label: "Title", required: true },
      {
        name: "slug",
        type: "string",
        label: "URL Slug",
        required: true,
        unique: true,
      },
      { name: "content", type: "text", label: "Content", required: true },
      {
        name: "published",
        type: "boolean",
        label: "Published",
        default: false,
      },
      { name: "published_at", type: "datetime", label: "Published Date" },
      { name: "author", type: "string", label: "Author Name", required: true },
    ],
    displayField: "title",
  });

  // Seed some products
  recordManager.createRecord(productModel.id, {
    name: "Wireless Headphones",
    description:
      "Premium noise-canceling wireless headphones with 30-hour battery life",
    price: 299.99,
    in_stock: true,
    launch_date: "2024-01-15",
    website: "https://example.com/headphones",
  });

  recordManager.createRecord(productModel.id, {
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    price: 399.99,
    in_stock: true,
    launch_date: "2024-03-20",
    website: "https://example.com/smartwatch",
  });

  recordManager.createRecord(productModel.id, {
    name: "Laptop Stand",
    description: "Ergonomic aluminum laptop stand",
    price: 49.99,
    in_stock: false,
    launch_date: "2024-02-10",
    website: "https://example.com/stand",
  });

  // Seed some customers
  recordManager.createRecord(customerModel.id, {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0101",
    is_active: true,
    joined_date: "2024-01-10",
    notes: "VIP customer",
  });

  recordManager.createRecord(customerModel.id, {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-0102",
    is_active: true,
    joined_date: "2024-02-15",
    notes: "",
  });

  // Seed a blog post
  recordManager.createRecord(blogModel.id, {
    title: "Welcome to Our New Admin Interface",
    slug: "welcome-admin-interface",
    content:
      "This is our new Django-like admin interface built with Next.js and Tailwind CSS...",
    published: true,
    published_at: "2024-10-17T10:00:00",
    author: "Admin",
  });

  console.log("✅ Admin data seeded successfully!");
  console.log(
    "Models created:",
    [productModel, customerModel, blogModel].map((m) => m.name)
  );
}

export function clearAdminData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_models");
    localStorage.removeItem("admin_records");
    console.log("✅ Admin data cleared!");
  }
}
