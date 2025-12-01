# Admin Interface Documentation

## Overview

This admin interface provides Django-like functionality with full CRUD capabilities, dynamic model creation, and schema management.

## Features

### ✅ Implemented

1. **Dynamic Schema Management**

   - Create models with custom fields
   - Support for multiple field types (string, text, number, boolean, date, email, url, json)
   - Field validation (required, unique, min/max, patterns)
   - Visual schema builder with drag-and-drop UI

2. **Full CRUD Operations**

   - Create, Read, Update, Delete records
   - Bulk operations (multi-select delete)
   - Search and filtering
   - Data validation

3. **Field Types**

   - `string` - Short text input
   - `text` - Long text (textarea)
   - `number` - Numeric input with min/max
   - `boolean` - Checkbox (Yes/No)
   - `date` - Date picker
   - `datetime` - Date and time picker
   - `email` - Email with validation
   - `url` - URL with validation
   - `json` - JSON editor

4. **UI Components**
   - Responsive admin layout with sidebar
   - Data tables with sorting and pagination
   - Form generators based on schema
   - Search and filter functionality

## Usage

### Access the Admin Panel

Navigate to `/admin` to access the admin interface.

### Create a New Model

1. Go to **Schema Builder** (`/admin/schema`)
2. Fill in model information:
   - Model name (internal identifier)
   - Display label
   - Plural label
   - Icon
   - Description
3. Add fields with:
   - Field name
   - Display label
   - Field type
   - Validation rules (required, unique, min/max)
4. Click "Create Model"

### Manage Records

1. From the dashboard, click on a model
2. **List View**: See all records in a table
3. **Create**: Click "+ Add Record" button
4. **View**: Click "View" on any record
5. **Edit**: Click "Edit" on any record
6. **Delete**: Click "Delete" or use bulk delete with checkboxes

### Example: Creating a "Product" Model

```typescript
// Model configuration
{
  name: "product",
  label: "Product",
  pluralLabel: "Products",
  icon: "📦",
  fields: [
    { name: "name", type: "string", label: "Product Name", required: true },
    { name: "description", type: "text", label: "Description" },
    { name: "price", type: "number", label: "Price", required: true, min: 0 },
    { name: "in_stock", type: "boolean", label: "In Stock" },
    { name: "launch_date", type: "date", label: "Launch Date" },
    { name: "website", type: "url", label: "Website" },
  ]
}
```

## Data Storage

Currently uses **localStorage** for development:

- Models stored in `admin_models` key
- Records stored in `admin_records` key

### Migration to Production

To use with AWS Amplify and DynamoDB:

1. Update `lib/admin/schema-manager.ts` to use Amplify DataStore
2. Update `lib/admin/record-manager.ts` to use Amplify DataStore
3. Define Amplify schema in `amplify/data/resource.ts`

Example Amplify schema:

```typescript
// amplify/data/resource.ts
const schema = a.schema({
  AdminModel: a
    .model({
      name: a.string().required(),
      label: a.string().required(),
      pluralLabel: a.string(),
      description: a.string(),
      icon: a.string(),
      fields: a.json().required(),
      displayField: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  AdminRecord: a
    .model({
      modelId: a.string().required(),
      data: a.json().required(),
    })
    .authorization((allow) => [allow.authenticated()]),
});
```

## Architecture

### Directory Structure

```
app/admin/
  ├── layout.tsx                 # Admin layout with sidebar
  ├── page.tsx                   # Dashboard
  ├── schema/
  │   └── page.tsx              # Schema builder
  └── models/
      └── [modelId]/
          ├── page.tsx           # List records
          ├── create/
          │   └── page.tsx       # Create record
          └── [recordId]/
              ├── page.tsx       # View record
              └── edit/
                  └── page.tsx   # Edit record

lib/admin/
  ├── types.ts                   # TypeScript types
  ├── schema-manager.ts          # Model schema management
  └── record-manager.ts          # CRUD operations
```

## Future Enhancements

### Authentication & Authorization

- Integrate with Amplify Auth
- Role-based access control (admin, editor, viewer)
- Per-model permissions

### Advanced Features

- Relationship fields (hasOne, hasMany, belongsTo, manyToMany)
- File upload support
- Rich text editor
- Data import/export (CSV, JSON)
- Audit logs
- API generation for each model
- GraphQL queries auto-generation

### UI Improvements

- Dark mode
- Customizable themes
- Advanced filtering UI
- Sortable fields
- Column visibility toggles
- Saved views

## API Reference

### Schema Manager

```typescript
import { schemaManager } from '@/lib/admin/schema-manager';

// Create a model
const model = schemaManager.createModel({
  name: 'product',
  label: 'Product',
  pluralLabel: 'Products',
  fields: [...],
});

// Get model
const model = schemaManager.getModel(modelId);

// Update model
schemaManager.updateModel(modelId, { label: 'New Label' });

// Delete model
schemaManager.deleteModel(modelId);

// Get all models
const models = schemaManager.getAllModels();
```

### Record Manager

```typescript
import { recordManager } from "@/lib/admin/record-manager";

// Create record
const record = recordManager.createRecord(modelId, {
  name: "Product 1",
  price: 99.99,
});

// Get records
const { records, total } = recordManager.getRecords(modelId, {
  limit: 10,
  offset: 0,
  orderBy: "name",
  filter: { in_stock: true },
});

// Update record
recordManager.updateRecord(modelId, recordId, { price: 89.99 });

// Delete record
recordManager.deleteRecord(modelId, recordId);

// Bulk delete
recordManager.bulkDelete(modelId, [id1, id2, id3]);
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **AWS Amplify** - Backend (ready to integrate)

## License

MIT
