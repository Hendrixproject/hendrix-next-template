export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import AdminSetup from "./page";

export default function AdminSetupServer() {
  return <AdminSetup />;
}
