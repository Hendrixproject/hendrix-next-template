// Core types for the admin system

export type FieldType =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "json"
  | "relation";

export type RelationType = "hasOne" | "hasMany" | "belongsTo" | "manyToMany";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
  options?: string[]; // For select fields
  min?: number;
  max?: number;
  pattern?: string;
  helpText?: string;

  // For relation fields
  relationType?: RelationType;
  relatedModel?: string;
  foreignKey?: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  label: string;
  pluralLabel: string;
  description?: string;
  icon?: string;
  fields: FieldDefinition[];
  displayField?: string; // Field to use for display
  orderBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordData {
  [key: string]: any;
}

export interface ModelRecord {
  id: string;
  modelId: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  permissions: string[];
}
