"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Panel,
  SidePanel,
  Switch,
  DropMenu,
  Button,
  HamburgerMenuIcon,
  HomeIcon,
  TableIcon,
  WrenchIcon,
  UserIcon,
} from "lucid-ui";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize from system preference if available
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(
      document.documentElement.classList.contains("dark") || prefersDark
    );
  }, []);

  const toggleTheme = (isSelected: boolean) => {
    setDarkMode(isSelected);
    if (isSelected) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/admin/models", label: "Models", icon: <TableIcon /> },
    { href: "/admin/schema", label: "Schema Builder", icon: <WrenchIcon /> },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#0f172a" : "#f8fafc",
      }}
    >
      {/* Topbar */}
      <Panel
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: darkMode ? "#111827" : "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button kind="invisible" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <HamburgerMenuIcon />
          </Button>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <Image
              src="/images/hendrix-logo.png"
              alt="Hendrix Logo"
              width={28}
              height={28}
              style={{ borderRadius: 6 }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: darkMode ? "#fff" : "#0f172a",
              }}
            >
              Hendrix Admin
            </span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ fontSize: 12, color: darkMode ? "#cbd5e1" : "#64748b" }}
            >
              Dark
            </span>
            <Switch
              isSelected={darkMode}
              onSelect={(isSelected) => toggleTheme(isSelected)}
            />
          </div>
          <DropMenu>
            <DropMenu.Control>
              <Button kind="invisible">
                <UserIcon />
              </Button>
            </DropMenu.Control>
            <DropMenu.Option>Profile</DropMenu.Option>
            <DropMenu.Option>Settings</DropMenu.Option>
            <DropMenu.Option>Sign out</DropMenu.Option>
          </DropMenu>
        </div>
      </Panel>

      {/* Sidebar */}
      <SidePanel
        isExpanded={sidebarOpen}
        position="left"
        onCollapse={() => setSidebarOpen(false)}
        isAnimated
        isResizeDisabled
        preventBodyScroll={false}
        width={280}
        topOffset={64}
        style={{
          background: darkMode ? "#111827" : "#ffffff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: darkMode ? "#94a3b8" : "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Navigation
          </span>
        </div>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 12,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontWeight: 600,
                  textDecoration: "none",
                  background: active
                    ? darkMode
                      ? "#1f2937"
                      : "#eef2ff"
                    : "transparent",
                  color: active
                    ? darkMode
                      ? "#e5e7eb"
                      : "#3730a3"
                    : darkMode
                    ? "#cbd5e1"
                    : "#334155",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            marginTop: "auto",
            padding: 16,
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 12,
              color: darkMode ? "#e5e7eb" : "#0f172a",
            }}
          >
            Hendrix Admin v1.0
          </div>
          <div
            style={{
              fontSize: 11,
              color: darkMode ? "#94a3b8" : "#64748b",
              marginTop: 4,
            }}
          >
            Next.js 15 • React 19
          </div>
        </div>
      </SidePanel>

      {/* Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? 280 : 0,
          transition: "margin-left 300ms ease",
          paddingTop: 64,
        }}
      >
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
