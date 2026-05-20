"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="page-enter pt-24">
      <div className="max-w-xl mx-auto px-6 py-24">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-4">
          Contact
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center tracking-wider mb-16">
          Let&apos;s work together
        </p>

        {status === "sent" ? (
          <div className="text-center py-12 animate-slide-up">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full border border-[var(--accent)] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              Thank you for your message. I&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border-light)] py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border-light)] py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border-light)] py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors resize-none placeholder:text-[var(--text-muted)]"
                placeholder="Tell me about your project..."
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs tracking-wider">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full border border-[var(--accent)] py-3 text-xs tracking-[0.3em] uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
