"use client";

import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fit?: "contain" | "cover";
};

function isPlaceholderSrc(src: string) {
  return (
    src === PLACEHOLDER_PRODUCT_IMAGE ||
    src.endsWith("/images/placeholder-product.svg")
  );
}

/**
 * 有有效遠端圖時只顯示產品圖；僅在無圖、失敗或明確 placeholder 時才顯示預設圖。
 */
export function ProductImage({
  src,
  alt = "",
  className,
  containerClassName,
  fit = "contain",
}: Props) {
  const trimmed = src?.trim() ?? "";
  const imgRef = useRef<HTMLImageElement>(null);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const usePlaceholderOnly =
    !trimmed || isPlaceholderSrc(trimmed) || errored;

  useEffect(() => {
    setErrored(false);
    setLoaded(false);
  }, [trimmed]);

  // 快取命中時 onLoad 可能已觸發，需手動檢查 complete
  useEffect(() => {
    if (usePlaceholderOnly) return;
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [trimmed, usePlaceholderOnly]);

  const fitClass = fit === "cover" ? "object-cover" : "object-contain";
  const imgLayout = "absolute inset-0 h-full w-full";

  if (usePlaceholderOnly) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
          containerClassName
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PLACEHOLDER_PRODUCT_IMAGE}
          alt={alt}
          className={cn(imgLayout, fitClass, "p-1.5", className)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-100 dark:bg-zinc-800",
        containerClassName
      )}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700" aria-hidden />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={trimmed}
        alt={alt}
        className={cn(
          imgLayout,
          fitClass,
          "z-10 transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
