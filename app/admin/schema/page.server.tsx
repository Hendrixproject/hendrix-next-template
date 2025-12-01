export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import SchemaBuilder from "./page";

export default function SchemaBuilderServer() {
  return <SchemaBuilder />;
}
