"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/types";

export default function ContactPage() {
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

  const email = settings?.contact_email;
  const instagram = settings?.instagram_url;

  return (
    <div className="page-enter pt-24">
      <div className="max-w-xl mx-auto px-6 py-24">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-4">
          Contact
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center tracking-wider mb-16">
          Let&apos;s work together
        </p>

        <div className="space-y-8 text-center">
          {email ? (
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--text-muted)] mb-3">
                Email
              </p>
              <a
                href={`mailto:${email}`}
                className="text-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300 font-light"
              >
                {email}
              </a>
            </div>
          ) : null}

          {instagram ? (
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--text-muted)] mb-3">
                Instagram
              </p>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300 font-light tracking-wider"
              >
                Follow &rarr;
              </a>
            </div>
          ) : null}

          {!email && !instagram && (
            <p className="text-[var(--text-muted)] text-sm">
              Contact information can be configured in the admin panel.
            </p>
          )}

          <div className="flex items-center justify-center gap-4 py-8">
            <div className="w-12 h-px bg-[var(--border-light)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <div className="w-12 h-px bg-[var(--border-light)]" />
          </div>

          <p className="text-[var(--text-muted)] text-xs tracking-wider leading-relaxed max-w-sm mx-auto">
            Available for commissions, collaborations, and print inquiries.
            I&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
}
