/**
 * User-uploaded listing images (Imgur / future S3). Catalog go-shoot URLs are not managed here.
 */

export type ImgurUploadResult = {
  url: string;
  deleteHash: string | null;
};

export function isManagedUserUpload(storagePath: string): boolean {
  const p = storagePath.trim();
  if (!p) return false;
  if (p.includes("go-shoot.github.io")) return false;
  if (/imgur\.com/i.test(p)) return true;
  const publicBase = (process.env.S3_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (publicBase && p.startsWith(publicBase)) return true;
  if (!/^https?:\/\//i.test(p)) return true;
  return false;
}

export async function uploadToImgur(imageBuffer: Buffer): Promise<ImgurUploadResult> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) throw new Error("IMGUR_CLIENT_ID not configured");

  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBuffer.toString("base64"),
      type: "base64",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Imgur upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const link: string | undefined = data.data?.link;
  if (!link) throw new Error("Imgur response missing link");
  const deleteHash: string | null = data.data?.deletehash ?? null;
  return { url: link, deleteHash };
}

async function deleteFromImgur(deleteHash: string): Promise<void> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) throw new Error("IMGUR_CLIENT_ID not configured");

  const res = await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
    method: "DELETE",
    headers: { Authorization: `Client-ID ${clientId}` },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Imgur delete failed (${res.status}): ${text}`);
  }
}

/** Best-effort delete from remote storage; logs and continues on failure. */
export async function deleteStoredImage(
  storagePath: string,
  deleteHash?: string | null,
): Promise<void> {
  if (!isManagedUserUpload(storagePath)) return;

  if (/imgur\.com/i.test(storagePath)) {
    if (!deleteHash) {
      console.warn("[image-storage] Imgur image missing deleteHash, cannot remote-delete:", storagePath);
      return;
    }
    await deleteFromImgur(deleteHash);
    return;
  }

  // S3/MinIO key path — restore when S3 upload is wired again
  console.warn("[image-storage] S3 delete not implemented for:", storagePath);
}
