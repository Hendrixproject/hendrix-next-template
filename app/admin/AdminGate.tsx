"use client";

import { ReactNode, useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

/**
 * Authorization boundary for the /admin area. Two gates:
 *   1. Authenticator — user must sign in (Cognito hosted UI components).
 *   2. Group check — the signed-in user must be in the `admins` group
 *      (the `cognito:groups` claim on the access token).
 *
 * A signed-in non-admin gets an Access Denied screen, not the admin UI.
 * The group is the real authorization boundary; the AppSync API still enforces
 * its own rules server-side, so this is defense-in-depth, not the only check.
 */
function AdminAuthorization({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const groups =
          (session.tokens?.accessToken.payload["cognito:groups"] as
            | string[]
            | undefined) ?? [];
        if (active) setStatus(groups.includes("admins") ? "allowed" : "denied");
      } catch {
        if (active) setStatus("denied");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
        Checking permissions…
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
          Access denied
        </h1>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          Your account is not a member of the <code>admins</code> group.
        </p>
        <button
          onClick={() => signOut()}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminGate({ children }: { children: ReactNode }) {
  return (
    <Authenticator>
      {() => <AdminAuthorization>{children}</AdminAuthorization>}
    </Authenticator>
  );
}
