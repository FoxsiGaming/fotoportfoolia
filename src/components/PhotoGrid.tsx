"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./Lightbox";

interface PhotoGridProps {
  photos: Photo[];
  showAlbumName?: boolean;
}

export function PhotoGrid({ photos, showAlbumName = false }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[var(--text-muted)] text-sm tracking-wider">
          No photos yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid stagger-children">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="masonry-item photo-card rounded-sm"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={`/uploads/${photo.filename}`}
              alt={photo.title || "Photo"}
              width={800}
              height={600}
              className="w-full h-auto block"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={80}
            />
            <div className="overlay">
              <div>
                {photo.title && (
                  <p className="text-white text-sm font-light tracking-wide">
                    {photo.title}
                  </p>
                )}
                {showAlbumName && photo.album_name && (
                  <p className="text-white/50 text-xs mt-1">
                    {photo.album_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((i) =>
              i !== null && i < photos.length - 1 ? i + 1 : i
            )
          }
          onPrev={() =>
            setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
          }
        />
      )}
    </>
  );
}
