import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Dynamic models",
    body: "Define and edit data models from the browser — no code, no migrations. Like Django admin, on the web.",
  },
  {
    title: "Full CRUD",
    body: "Auto-generated forms with validation for create, read, update and delete across every model.",
  },
  {
    title: "Search & bulk actions",
    body: "Filter records by any field and act on many at once. Sensible defaults, no setup.",
  },
  {
    title: "Auth built in",
    body: "Cognito sign-in gates the admin, scoped to an admins group. Secure from the first deploy.",
  },
  {
    title: "Deploys itself",
    body: "Push to main and AWS Amplify builds and ships the app and its backend. Near-zero ops.",
  },
  {
    title: "Modern stack",
    body: "Next.js 15, React 19, Tailwind CSS 4 and TypeScript — fast, typed, and current.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/hendrix-logo.png"
              alt="Hendrix"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-xl font-bold tracking-tight">Hendrix</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Admin
            </Link>
            <a
              href="https://github.com/Hendrixproject/hendrix"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Are you experienced?
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              The admin that plays your data like a Stratocaster.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Hendrix is a Django-like admin interface for AWS Amplify. Define
              models, manage records, and ship — all from the browser, deployed
              serverless and near-free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin" className={buttonVariants({ size: "lg" })}>
                Open the admin
              </Link>
              <a
                href="https://docs.amplify.aws/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Read the docs
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="mb-1 h-1 w-10 rounded-full bg-primary" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {f.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-8 text-sm font-medium text-muted-foreground">
            <span className="text-foreground">Built with</span>
            {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4", "AWS Amplify"].map(
              (t) => (
                <span key={t}>{t}</span>
              ),
            )}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 Hendrix. Built with ♥ on Next.js &amp; AWS Amplify.</span>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <a
              href="https://github.com/Hendrixproject/hendrix"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
