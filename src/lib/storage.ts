/** 圖片公開 URL — Imgur 的圖片已是完整 URL，直接回傳 */
export function publicStorageUrl(storagePath: string): string {
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  return storagePath;
}

/**
 * 上傳圖片到 Imgur（匿名上傳，免費方案）。
 * 需在環境變數設定 IMGUR_CLIENT_ID。
 * 回傳 Imgur 圖片直連 URL（如 https://i.imgur.com/xxxxx.jpg）。
 */
export async function uploadToImgur(imageBuffer: Buffer): Promise<string> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) throw new Error("IMGUR_CLIENT_ID not configured");

  const base64 = imageBuffer.toString("base64");

  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64, type: "base64" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Imgur upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const link: string = data.data?.link;
  if (!link) throw new Error("Imgur response missing link");
  return link;
}
