import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "./ConfigureAmplify";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hendrix — admin that rocks",
  description:
    "A Django-like admin interface built on Next.js 15, React 19, and AWS Amplify.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen, Grammarly) mutate <body> before React hydrates,
          which would otherwise log a hydration mismatch. Scoped to <body> only. */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ConfigureAmplify />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
