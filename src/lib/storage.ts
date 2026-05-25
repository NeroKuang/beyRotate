/** 圖片公開 URL（MinIO / S3 相容） */
export function publicStorageUrl(storagePath: string, bucket = "listing-images"): string {
  const base = (process.env.S3_PUBLIC_URL ?? process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "").replace(
    /\/$/,
    ""
  );
  if (!base) return `/api/files/${bucket}/${storagePath}`;
  return `${base}/${bucket}/${storagePath}`;
}
