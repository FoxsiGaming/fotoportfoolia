"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getSettings } from "@/lib/data";

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState("");
  const [siteSubtitle, setSiteSubtitle] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      setSiteTitle(s.site_title);
      setSiteSubtitle(s.site_subtitle);
      setAboutText(s.about_text);
      setContactEmail(s.contact_email);
      setInstagramUrl(s.instagram_url);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const settings = {
      site_title: siteTitle,
      site_subtitle: siteSubtitle,
      about_text: aboutText,
      contact_email: contactEmail,
      instagram_url: instagramUrl,
    };

    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-light tracking-wider mb-8">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={siteSubtitle}
            onChange={(e) => setSiteSubtitle(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
            About Text
          </label>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            rows={4}
            className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourhandle"
            className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--accent)] text-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-xs text-green-400 tracking-wider animate-slide-up">
              Settings saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
