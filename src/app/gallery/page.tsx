import Link from "next/link";
import Image from "next/image";
import { getAllAlbums, getAllPhotos } from "@/lib/data";
import { PhotoGrid } from "@/components/PhotoGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery | Portfolio",
};

export default function GalleryPage() {
  const albums = getAllAlbums();
  const allPhotos = getAllPhotos(200);

  return (
    <div className="page-enter pt-24">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-2">
          Gallery
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center tracking-wider">
          {allPhotos.length} photograph{allPhotos.length !== 1 ? "s" : ""} across{" "}
          {albums.length} collection{albums.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Album filters */}
      {albums.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/gallery"
              className="px-4 py-2 text-xs tracking-[0.2em] uppercase border border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
            >
              All
            </Link>
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
              >
                {album.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {allPhotos.length > 0 ? (
          <PhotoGrid photos={allPhotos} showAlbumName />
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

      {/* Albums grid below */}
      {albums.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24 border-t border-white/5 pt-24">
          <h2 className="text-xs tracking-[0.4em] uppercase text-[var(--text-muted)] mb-12 text-center">
            Browse by Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group relative aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)] rounded-sm"
              >
                {album.cover_photo ? (
                  <Image
                    src={`/uploads/${album.cover_photo.filename}`}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={75}
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
