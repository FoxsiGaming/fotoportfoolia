"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setEmail("");
      setPassword("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extralight tracking-[0.2em] uppercase text-center mb-12">
            Admin
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent border-b border-[var(--border-light)] py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)]"
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border-b border-[var(--border-light)] py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)]"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center tracking-wider">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full border border-[var(--accent)] py-3 text-xs tracking-[0.3em] uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-8">
            <Link
              href="/"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] tracking-wider transition-colors"
            >
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Authenticated admin layout
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Admin top bar */}
      <header className="sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-light tracking-[0.2em] uppercase text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              <Link
                href="/admin"
                className={`text-xs tracking-wider transition-colors ${
                  pathname === "/admin"
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Albums
              </Link>
              <Link
                href="/admin/settings"
                className={`text-xs tracking-wider transition-colors ${
                  pathname === "/admin/settings"
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              {user.email}
            </span>
            <Link
              href="/"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] tracking-wider transition-colors"
              target="_blank"
            >
              View Site →
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-[var(--text-muted)] hover:text-red-400 tracking-wider transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">{children}</div>
    </div>
  );
}
