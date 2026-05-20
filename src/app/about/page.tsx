"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/types";

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      setSettings(s);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-enter pt-24">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-16">
          About
        </h1>

        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] text-base leading-relaxed text-center font-light">
            {settings?.about_text ||
              "A passionate photographer capturing moments that matter."}
          </p>

          {/* Visual separator */}
          <div className="flex items-center justify-center gap-4 py-8">
            <div className="w-12 h-px bg-[var(--border-light)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <div className="w-12 h-px bg-[var(--border-light)]" />
          </div>

          {/* Contact info */}
          <div className="text-center space-y-4">
            {settings?.contact_email && (
              <p className="text-sm text-[var(--text-muted)]">
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="hover:text-[var(--accent)] transition-colors duration-300"
                >
                  {settings.contact_email}
                </a>
              </p>
            )}
            {settings?.instagram_url && (
              <p className="text-sm">
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 tracking-wider"
                >
                  Instagram →
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
