import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/30 dark:bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur opacity-75"></div>
              <Image
                src="/images/hendrix-logo.png"
                alt="Hendrix Logo"
                width={40}
                height={40}
                className="relative rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Hendrix</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-4 py-2"
            >
              Admin
            </Link>
            <Link
              href="/admin/setup"
              className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-glow group-hover:opacity-75 transition-opacity"></div>
              <div className="relative neuro-shadow rounded-3xl p-1 bg-white dark:bg-slate-800">
                <Image
                  src="/images/hendrix-logo.png"
                  alt="Hendrix Logo"
                  width={120}
                  height={120}
                  className="rounded-3xl"
                />
              </div>
            </div>
          </div>
          <h2 className="text-6xl md:text-7xl font-extrabold mb-6">
            <span className="gradient-text">Welcome to Hendrix</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            A powerful Django-like admin interface built with cutting-edge
            technologies:
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {" "}
              Next.js 15
            </span>
            ,
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {" "}
              React 19
            </span>
            , and
            <span className="font-semibold text-pink-600 dark:text-pink-400">
              {" "}
              AWS Amplify
            </span>
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/admin/setup"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Open Admin Panel</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <a
              href="https://docs.amplify.aws/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 glass font-bold rounded-2xl transition-all hover:scale-105 hover:shadow-xl text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
            >
              Documentation →
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="glass card-hover rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">🎨</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Dynamic Models
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Create and modify database models on-the-fly without writing code.
              Just like Django admin.
            </p>
          </div>

          <div className="glass card-hover rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Full CRUD Operations
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Create, read, update, and delete records with auto-generated forms
              and validation.
            </p>
          </div>

          <div className="glass card-hover rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Modern Stack
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Built with Next.js 15, React 19, Tailwind CSS 4, TypeScript, and
              AWS Amplify.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative glass rounded-3xl p-10 mb-20 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-black mb-3 gradient-text group-hover:scale-110 transition-transform">
                9+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Field Types
              </div>
            </div>
            <div className="group">
              <div className="text-5xl font-black mb-3 gradient-text group-hover:scale-110 transition-transform">
                100%
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Type Safe
              </div>
            </div>
            <div className="group">
              <div className="text-5xl font-black mb-3 gradient-text group-hover:scale-110 transition-transform">
                ∞
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Custom Models
              </div>
            </div>
            <div className="group">
              <div className="text-5xl font-black mb-3 gradient-text group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Lightning Fast
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-10">
            Powered By
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: "Next.js 15", gradient: "from-black to-slate-700" },
              { name: "React 19", gradient: "from-blue-500 to-cyan-600" },
              { name: "TypeScript", gradient: "from-blue-600 to-blue-700" },
              {
                name: "Tailwind CSS 4",
                gradient: "from-indigo-500 to-purple-600",
              },
              { name: "AWS Amplify", gradient: "from-orange-500 to-red-600" },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`bg-gradient-to-br ${tech.gradient} text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all`}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-slate-200/50 dark:border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur opacity-50"></div>
                <Image
                  src="/images/hendrix-logo.png"
                  alt="Hendrix Logo"
                  width={32}
                  height={32}
                  className="relative rounded-lg"
                />
              </div>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                © 2025 Hendrix. Built with ❤️ using Next.js & AWS Amplify.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Admin Panel
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://docs.amplify.aws/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
