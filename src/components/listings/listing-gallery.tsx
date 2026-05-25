"use client";

import { ProductImage } from "@/components/ui/product-image";

export function ListingGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) {
    return (
      <ProductImage
        src={null}
        alt=""
        containerClassName="aspect-square rounded-xl"
      />
    );
  }

  return (
    <div className="space-y-2">
      {urls.map((src, i) => (
        <ProductImage
          key={src + i}
          src={src}
          alt=""
          fit="cover"
          containerClassName="rounded-xl bg-zinc-100 dark:bg-zinc-800 aspect-square sm:aspect-auto sm:min-h-[280px]"
        />
      ))}
    </div>
  );
}
