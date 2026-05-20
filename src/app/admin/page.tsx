"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Album } from "@/lib/types";

export default function AdminDashboard() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      setAlbums(data);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });

      if (res.ok) {
        setNewName("");
        setNewDesc("");
        setShowCreate(false);
        fetchAlbums();
      }
    } catch (err) {
      console.error("Failed to create album:", err);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its photos? This cannot be undone.`)) {
      return;
    }

    try {
      await fetch(`/api/albums/${id}`, { method: "DELETE" });
      fetchAlbums();
    } catch (err) {
      console.error("Failed to delete album:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light tracking-wider">Albums</h1>
          <p className="text-[var(--text-muted)] text-xs mt-1 tracking-wider">
            {albums.length} album{albums.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[var(--accent)] text-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Album
        </button>
      </div>

      {/* Create album form */}
      {showCreate && (
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] border border-white/5 rounded-sm animate-slide-up">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
                Album Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Landscapes"
                className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="A short description of this collection..."
                className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors rounded-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[var(--accent)] text-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                  setNewDesc("");
                }}
                className="px-6 py-2 text-xs tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Albums list */}
      {albums.length === 0 ? (
        <div className="text-center py-24 bg-[var(--bg-secondary)] border border-white/5 rounded-sm">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="mx-auto text-[var(--text-muted)] mb-4"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-[var(--text-muted)] text-sm tracking-wider">
            No albums yet. Create your first album to start uploading photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group bg-[var(--bg-secondary)] border border-white/5 rounded-sm overflow-hidden hover:border-white/10 transition-colors"
            >
              {/* Album cover */}
              <Link
                href={`/admin/albums/${album.id}`}
                className="block relative aspect-[16/10] bg-[var(--bg-tertiary)] overflow-hidden"
              >
                {album.cover_photo ? (
                  <Image
                    src={`/uploads/${(album.cover_photo as { filename: string }).filename}`}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-[var(--text-muted)]"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Album info */}
              <div className="p-4 flex items-center justify-between">
                <Link href={`/admin/albums/${album.id}`} className="flex-1">
                  <h3 className="text-sm font-light tracking-wider text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {album.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {album.photo_count || 0} photos
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(album.id, album.name)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete album"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
