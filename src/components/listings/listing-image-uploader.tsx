"use client";

import { useState, useRef } from "react";
import { MAX_LISTING_IMAGES } from "@/lib/constants";

type UploadedImage = {
  id: string;
  url: string;
  sort_order: number;
};

export function ListingImageUploader({
  listingId,
  existingImages,
}: {
  listingId: string;
  existingImages: UploadedImage[];
}) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= MAX_LISTING_IMAGES) {
        setError(`最多 ${MAX_LISTING_IMAGES} 張圖片`);
        break;
      }

      const form = new FormData();
      form.append("file", file);

      try {
        const res = await fetch(`/api/listings/${listingId}/images`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "上傳失敗");
          break;
        }
        setImages((prev) => [...prev, data]);
      } catch {
        setError("上傳失敗，請檢查網路連線");
        break;
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (imageId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch {
      setError("刪除失敗");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">刊登圖片</h3>
        <span className="text-xs text-zinc-500">
          {images.length} / {MAX_LISTING_IMAGES}
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        上傳的圖片會自動加上 BeyRotate 浮水印以防盜圖。支援 JPG、PNG、WebP，每張最大 5MB。
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder-product.svg";
                }}
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute right-1 top-1 rounded-full bg-red-600/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="刪除"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_LISTING_IMAGES && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 p-6 text-sm text-zinc-500 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-600 dark:hover:border-emerald-500">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              上傳中…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              點擊或拖放上傳圖片
            </>
          )}
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
