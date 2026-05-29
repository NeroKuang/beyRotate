/** 圖片公開 URL — Imgur / S3 完整 URL 或 key */
export function publicStorageUrl(storagePath: string): string {
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const base = (process.env.S3_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!base) return storagePath;
  return `${base}/listing-images/${storagePath}`;
}

export { uploadToImgur, deleteStoredImage, isManagedUserUpload } from "@/lib/image-storage";
