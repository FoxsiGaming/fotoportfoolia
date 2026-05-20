import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumBySlug, getPhotosByAlbum, getAllAlbums } from "@/lib/data";
import { PhotoGrid } from "@/components/PhotoGrid";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  return {
    title: album ? `${album.name} | Portfolio` : "Not Found",
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  const photos = getPhotosByAlbum(album.id);
  const allAlbums = getAllAlbums();

  return (
    <div className="page-enter pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] tracking-wider">
          <Link
            href="/gallery"
            className="hover:text-[var(--text-secondary)] transition-colors"
          >
            Gallery
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{album.name}</span>
        </nav>
      </div>

      {/* Album header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase text-center mb-2">
          {album.name}
        </h1>
        {album.description && (
          <p className="text-[var(--text-secondary)] text-sm text-center max-w-xl mx-auto mt-4 leading-relaxed">
            {album.description}
          </p>
        )}
        <p className="text-[var(--text-muted)] text-xs text-center tracking-wider mt-4">
          {photos.length} photograph{photos.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs for switching between albums */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/gallery"
            className="px-4 py-2 text-xs tracking-[0.2em] uppercase border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
          >
            All
          </Link>
          {allAlbums.map((a) => (
            <Link
              key={a.id}
              href={`/gallery/${a.slug}`}
              className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                a.id === album.id
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {a.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <PhotoGrid photos={photos} />
      </div>
    </div>
  );
}
