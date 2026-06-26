"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import AdminGate from "./AdminGate";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/schema", label: "Schema Builder" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname?.startsWith(href);

  return (
    <AdminGate>
      {/* Robust two-row / two-column grid: header spans the top, then a fixed
          sidebar + fluid content. No absolute positioning, so nothing overlaps. */}
      <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
        <header className="flex items-center justify-between gap-4 border-b bg-card px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/images/hendrix-logo.png"
              alt="Hendrix"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-lg font-bold tracking-tight">
              Hendrix{" "}
              <span className="font-normal text-muted-foreground">admin</span>
            </span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </header>

        <div className="grid md:grid-cols-[220px_1fr]">
          <aside className="border-b bg-card p-3 md:border-b-0 md:border-r">
            <nav className="flex gap-1 md:flex-col">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 px-6 py-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}
