import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "./ConfigureAmplify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hendrix Admin",
  description:
    "A Django-like admin interface built on Next.js, React, and AWS Amplify.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen, Grammarly) mutate <body> before React hydrates,
          which would otherwise log a hydration mismatch. Scoped to <body> only. */}
      <body className={inter.className} suppressHydrationWarning>
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
