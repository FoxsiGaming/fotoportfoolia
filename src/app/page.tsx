"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllAlbums, getFeaturedPhotos, getAllPhotos, getSettings } from "@/lib/data";
import type { Album, Photo, SiteSettings } from "@/lib/types";

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, a, featured, all] = await Promise.all([
        getSettings(),
        getAllAlbums(),
        getFeaturedPhotos(6),
        getAllPhotos(6),
      ]);
      setSettings(s);
      setAlbums(a);
      setRecentPhotos(featured.length > 0 ? featured : all);
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

  const heroPhoto = recentPhotos[0];

  return (
    <div className="page-enter">
      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">
        {heroPhoto ? (
          <>
            <Image
              src={heroPhoto.image_url}
              alt={heroPhoto.title || "Featured photo"}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]" />
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[0.2em] uppercase text-white mb-4 animate-slide-up">
            {settings?.site_title || "Portfolio"}
          </h1>
          <p
            className="text-sm md:text-base font-light tracking-[0.3em] uppercase text-white/60 mb-12 animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            {settings?.site_subtitle || "Photography"}
          </p>
          <Link
            href="/gallery"
            className="animate-slide-up border border-white/30 px-8 py-3 text-xs tracking-[0.3em] uppercase text-white/80 hover:bg-white/10 hover:border-white/50 transition-all duration-500"
            style={{ animationDelay: "0.3s" }}
          >
            View Gallery
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-12 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ─── Albums Section ──────────────────────────────── */}
      {albums.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-xs tracking-[0.4em] uppercase text-[var(--text-muted)] mb-12 text-center">
            Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)] rounded-sm"
              >
                {album.cover_photo ? (
                  <Image
                    src={album.cover_photo.image_url}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--text-muted)]">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-end">
                  <div className="p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <h3 className="text-white text-lg font-light tracking-wider">{album.name}</h3>
                    <p className="text-white/50 text-xs mt-1 tracking-wider">
                      {album.photo_count || 0} photo{album.photo_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Recent Work Section ─────────────────────────── */}
      {recentPhotos.length > 1 && (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <h2 className="text-xs tracking-[0.4em] uppercase text-[var(--text-muted)] mb-12 text-center">
            Recent Work
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 stagger-children">
            {recentPhotos.slice(0, 6).map((photo) => (
              <Link
                key={photo.id}
                href={`/gallery/${photo.album_slug || ""}`}
                className="photo-card relative aspect-square overflow-hidden bg-[var(--bg-secondary)] rounded-sm"
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title || "Photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="overlay">
                  <p className="text-white text-xs font-light tracking-wider">{photo.title}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-block border border-[var(--border-light)] px-8 py-3 text-xs tracking-[0.3em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all duration-500"
            >
              View All Work
            </Link>
          </div>
        </section>
      )}

      {/* ─── Empty state ─────────────────────────────────── */}
      {!loading && albums.length === 0 && recentPhotos.length === 0 && (
        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="text-[var(--text-muted)] text-sm tracking-wider mb-6">
            Your portfolio is empty. Add some albums and photos via the admin panel.
          </p>
          <Link
            href="/admin"
            className="inline-block border border-[var(--accent)] px-8 py-3 text-xs tracking-[0.3em] uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
          >
            Go to Admin
          </Link>
        </section>
      )}
    </div>
  );
}
