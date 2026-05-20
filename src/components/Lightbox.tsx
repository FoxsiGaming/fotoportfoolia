"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrev();
          break;
      }
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  const hasExif =
    photo.exif_camera ||
    photo.exif_lens ||
    photo.exif_aperture ||
    photo.exif_shutter ||
    photo.exif_iso;

  return (
    <div className="lightbox-backdrop fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/40 text-sm font-light tracking-wider">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          aria-label="Previous photo"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          aria-label="Next photo"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="lightbox-image relative w-full h-full flex items-center justify-center p-4 md:p-16"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative max-w-full max-h-full">
          <Image
            src={photo.image_url}
            alt={photo.title || "Photo"}
            width={1920}
            height={1280}
            className="max-h-[85vh] w-auto object-contain"
            priority
            quality={90}
          />

          {/* Info bar */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full pt-4 flex items-start justify-between gap-4">
            <div>
              {photo.title && (
                <h3 className="text-white/90 text-sm font-light tracking-wide">
                  {photo.title}
                </h3>
              )}
              {photo.description && (
                <p className="text-white/40 text-xs mt-1">
                  {photo.description}
                </p>
              )}
            </div>
            {hasExif && (
              <div className="flex gap-4 text-white/30 text-xs font-light shrink-0">
                {photo.exif_camera && <span>{photo.exif_camera}</span>}
                {photo.exif_aperture && <span>{photo.exif_aperture}</span>}
                {photo.exif_shutter && <span>{photo.exif_shutter}</span>}
                {photo.exif_iso && <span>ISO {photo.exif_iso}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
