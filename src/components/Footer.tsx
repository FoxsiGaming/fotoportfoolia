"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-white/5 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] tracking-widest uppercase transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
