"use client";

import Image from "next/image";
import { useState } from "react";
import { photos, type Photo } from "@/config/site";

const PHOTOS_PATH = "C:\\isyraf\\photos";

export default function PhotosWindow() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const address = selectedPhoto
    ? `${PHOTOS_PATH}\\${selectedPhoto.filename}`
    : PHOTOS_PATH;

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-1">
      <div className="mb-1 flex shrink-0 items-center gap-2">
        {selectedPhoto && (
          <button
            type="button"
            className="bevel-out shrink-0 bg-win-face px-3 py-1 font-pixel text-base leading-none active:translate-x-px active:translate-y-px"
            onClick={() => setSelectedPhoto(null)}
          >
            Back
          </button>
        )}
        <span className="shrink-0 font-pixel text-base">Address</span>
        <div className="bevel-in min-w-0 flex-1 truncate bg-white px-2 py-1 font-content text-xs">
          {address}
        </div>
      </div>

      <div className="bevel-in min-h-0 flex-1 overflow-auto bg-white">
        {selectedPhoto ? (
          <figure className="flex min-h-full flex-col p-3">
            <div className="relative min-h-60 flex-1 bg-[#202020]">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-contain"
                priority
              />
            </div>
            <figcaption className="shrink-0 pt-3 text-center">
              <div className="font-pixel text-lg leading-none">
                {selectedPhoto.filename}
              </div>
              {selectedPhoto.note && (
                <p className="mt-1 text-sm text-neutral-600">
                  {selectedPhoto.note}
                </p>
              )}
            </figcaption>
          </figure>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <button
                key={photo.filename}
                type="button"
                aria-label={`Open ${photo.filename}`}
                className="group flex min-w-0 flex-col items-center gap-1 border border-dotted border-transparent p-1 text-center hover:border-win-navy hover:bg-win-navy hover:text-white focus-visible:border-win-navy focus-visible:bg-win-navy focus-visible:text-white focus-visible:outline-none"
                onClick={() => setSelectedPhoto(photo)}
              >
                <span className="bevel-out relative aspect-[4/3] w-full overflow-hidden bg-win-face p-1">
                  <Image
                    src={photo.src}
                    alt=""
                    width={240}
                    height={180}
                    sizes="(max-width: 640px) 45vw, 180px"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="w-full [overflow-wrap:anywhere] font-pixel text-base leading-none">
                  {photo.filename}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bevel-well mt-1 shrink-0 px-2 py-0.5 font-pixel text-base leading-none">
        {selectedPhoto ? selectedPhoto.filename : `${photos.length} object(s)`}
      </div>
    </div>
  );
}
