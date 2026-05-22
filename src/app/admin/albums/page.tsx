"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getAlbumById,
  getPhotosByAlbum,
  updateAlbum,
  updatePhoto,
  deletePhoto,
  uploadPhoto,
  reorderPhotos,
} from "@/lib/data";
import type { Album, Photo } from "@/lib/types";

export default function AdminAlbumPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminAlbumContent />
    </Suspense>
  );
}

function AdminAlbumContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const albumId = searchParams.get("id");

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDesc, setPhotoDesc] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchAlbum = useCallback(async () => {
    if (!albumId) {
      router.push("/admin");
      return;
    }
    try {
      const data = await getAlbumById(albumId);
      if (!data) {
        router.push("/admin");
        return;
      }
      setAlbum(data);
      setAlbumName(data.name);
      setAlbumDesc(data.description || "");

      const albumPhotos = await getPhotosByAlbum(albumId);
      setPhotos(albumPhotos);
    } catch {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [albumId, router]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  // ─── Upload ────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !albumId) return;

    setUploading(true);
    setUploadProgress(0);

    const total = files.length;
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      await uploadPhoto(files[i], albumId);
      completed++;
      setUploadProgress(Math.round((completed / total) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fetchAlbum();
  }

  // ─── Album name update ─────────────────────────────────
  async function handleSaveAlbumName() {
    if (!albumName.trim() || !albumId) return;

    await updateAlbum(albumId, {
      name: albumName.trim(),
      description: albumDesc.trim(),
    });

    setEditingName(false);
    fetchAlbum();
  }

  // ─── Photo metadata update ─────────────────────────────
  async function handleSavePhoto(photoId: string) {
    await updatePhoto(photoId, {
      title: photoTitle,
      description: photoDesc,
    });

    setEditingPhoto(null);
    fetchAlbum();
  }

  // ─── Toggle featured ───────────────────────────────────
  async function toggleFeatured(photo: Photo) {
    await updatePhoto(photo.id, { featured: !photo.featured });
    fetchAlbum();
  }

  // ─── Delete photo ──────────────────────────────────────
  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;

    await deletePhoto(photoId);
    fetchAlbum();
  }

  // ─── Drag and drop reorder ─────────────────────────────
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    if (!albumId) return;

    const reordered = [...photos];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);
    setPhotos(reordered);

    dragItem.current = null;
    dragOverItem.current = null;

    const photoIds = reordered.map((p) => p.id);
    await reorderPhotos(albumId, photoIds);
  }

  // ─── Set as cover ──────────────────────────────────────
  async function setCover(photoId: string) {
    if (!albumId) return;
    await updateAlbum(albumId, { cover_photo_id: photoId });
    fetchAlbum();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] tracking-wider mb-6">
        <Link
          href="/admin"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Albums
        </Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">{album.name}</span>
      </nav>

      {/* Album header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          {editingName ? (
            <div className="space-y-3">
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-white/10 px-3 py-2 text-lg font-light text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none rounded-sm"
                autoFocus
              />
              <input
                type="text"
                value={albumDesc}
                onChange={(e) => setAlbumDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-[var(--bg-tertiary)] border border-white/10 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none rounded-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAlbumName}
                  className="bg-[var(--accent)] text-black px-4 py-1.5 text-xs tracking-widest uppercase"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setAlbumName(album.name);
                    setAlbumDesc(album.description || "");
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] px-4 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setEditingName(true)}
                className="text-xl font-light tracking-wider text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors text-left"
                title="Click to edit"
              >
                {album.name}
              </button>
              {album.description && (
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {album.description}
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} · Click
                name to edit
              </p>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={`flex items-center gap-2 cursor-pointer px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
              uploading
                ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-wait"
                : "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Uploading {uploadProgress}%
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload Photos
              </>
            )}
          </label>
        </div>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="mb-8 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Photos grid (drag & drop) */}
      {photos.length === 0 ? (
        <div className="text-center py-24 bg-[var(--bg-secondary)] border border-white/5 rounded-sm border-dashed">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="mx-auto text-[var(--text-muted)] mb-4"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p className="text-[var(--text-muted)] text-sm tracking-wider mb-4">
            No photos yet. Upload some images to get started.
          </p>
          <label
            htmlFor="photo-upload"
            className="inline-block cursor-pointer border border-[var(--accent)] px-6 py-2 text-xs tracking-widest uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
          >
            Upload Photos
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="group relative bg-[var(--bg-secondary)] border border-white/5 rounded-sm overflow-hidden cursor-grab active:cursor-grabbing hover:border-white/10 transition-all"
            >
              {/* Photo thumbnail */}
              <div className="relative aspect-square">
                <Image
                  src={photo.image_url}
                  alt={photo.title || "Photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Featured badge */}
                {photo.featured && (
                  <div className="absolute top-2 left-2 bg-[var(--accent)] text-black px-2 py-0.5 text-[10px] tracking-wider uppercase">
                    Featured
                  </div>
                )}

                {/* Drag handle indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  >
                    <circle cx="9" cy="5" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="19" r="1" />
                  </svg>
                </div>

                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditingPhoto(photo.id);
                      setPhotoTitle(photo.title || "");
                      setPhotoDesc(photo.description || "");
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleFeatured(photo)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
                    title={photo.featured ? "Unfeature" : "Feature"}
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill={photo.featured ? "var(--accent)" : "none"}
                      stroke={photo.featured ? "var(--accent)" : "white"}
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCover(photo.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
                    title="Set as album cover"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-white/10 hover:bg-red-500/30 rounded-sm transition-colors"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Photo title */}
              <div className="p-2">
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {photo.title || photo.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo edit modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-sm w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-sm font-light tracking-widest uppercase text-[var(--text-primary)] mb-6">
              Edit Photo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none rounded-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
                  Description
                </label>
                <textarea
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--bg-tertiary)] border border-white/5 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none rounded-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleSavePhoto(editingPhoto)}
                className="bg-[var(--accent)] text-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag reorder tip */}
      {photos.length > 1 && (
        <p className="text-center text-[var(--text-muted)] text-xs tracking-wider mt-8">
          Drag and drop photos to reorder them
        </p>
      )}
    </div>
  );
}
