"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllAlbums, getAllPhotos, getAlbumBySlug, getPhotosByAlbum } from "@/lib/data";
import { PhotoGrid } from "@/components/PhotoGrid";
import type { Album, Photo } from "@/lib/types";

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const albumSlug = searchParams.get("album");

  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allAlbums = await getAllAlbums();
      setAlbums(allAlbums);

      if (albumSlug) {
        const album = await getAlbumBySlug(albumSlug);
        if (album) {
          setActiveAlbum(album);
          const albumPhotos = await getPhotosByAlbum(album.id);
          setPhotos(albumPhotos);
        } else {
          setActiveAlbum(null);
          const all = await getAllPhotos(200);
          setPhotos(all);
        }
      } else {
        setActiveAlbum(null);
        const all = await getAllPhotos(200);
        setPhotos(all);
      }
      setLoading(false);
    }
    load();
  }, [albumSlug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-enter pt-24">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-2">
          {activeAlbum ? activeAlbum.name : "Gallery"}
        </h1>
        {activeAlbum?.description && (
          <p className="text-[var(--text-secondary)] text-sm text-center max-w-xl mx-auto mt-4 leading-relaxed">
            {activeAlbum.description}
          </p>
        )}
        <p className="text-[var(--text-muted)] text-sm text-center tracking-wider mt-2">
          {photos.length} photograph{photos.length !== 1 ? "s" : ""}
          {!activeAlbum && albums.length > 0 && (
            <> across {albums.length} collection{albums.length !== 1 ? "s" : ""}</>
          )}
        </p>
      </div>

      {/* Album filters */}
      {albums.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/gallery"
              className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                !activeAlbum
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              All
            </Link>
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery?album=${album.slug}`}
                className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                  activeAlbum?.id === album.id
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {album.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {photos.length > 0 ? (
          <PhotoGrid photos={photos} showAlbumName={!activeAlbum} />
        ) : (
          <div className="text-center py-24">
            <div className="mb-6">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="mx-auto text-[var(--text-muted)]"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)] text-sm tracking-wider mb-6">
              No photos have been uploaded yet.
            </p>
            <Link
              href="/admin"
              className="inline-block border border-[var(--accent)] px-6 py-2 text-xs tracking-widest uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
            >
              Upload Photos
            </Link>
          </div>
        )}
      </div>

      {/* Albums grid below (only when showing all) */}
      {!activeAlbum && albums.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24 border-t border-white/5 pt-24">
          <h2 className="text-xs tracking-[0.4em] uppercase text-[var(--text-muted)] mb-12 text-center">
            Browse by Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery?album=${album.slug}`}
                className="group relative aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)] rounded-sm"
              >
                {album.cover_photo ? (
                  <Image
                    src={album.cover_photo.image_url}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-white text-lg font-light tracking-[0.2em] uppercase">
                      {album.name}
                    </h3>
                    <p className="text-white/40 text-xs mt-2 tracking-wider">
                      {album.photo_count || 0} photos
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
