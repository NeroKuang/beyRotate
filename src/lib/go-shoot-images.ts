import { GO_SHOOT_DB } from "@/lib/constants";
import { goShootProductImageUrl } from "@/lib/go-shoot-product-images";
import { inferProductLine } from "@/lib/catalog/part-names-zh";

export const GO_SHOOT_IMG = "https://go-shoot.github.io/x/img";

/** YouTube 影片縮圖（僅作最後 fallback） */
export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** 單獨零件圖（go-shoot /x/img/…） */
export function goShootPartImageUrl(part: {
  partType: string;
  abbr: string;
  line?: string | null;
  partGroup?: string | null;
}): string | null {
  const { partType, abbr } = part;
  if (!abbr) return null;

  if (partType === "blade") {
    const line = part.line?.trim();
    const group = part.partGroup?.trim();
    if (line && group) {
      return `${GO_SHOOT_IMG}/blade/${line}/${group}/${abbr}.png`;
    }
    return `${GO_SHOOT_IMG}/blade/${abbr}.png`;
  }
  if (partType === "ratchet") {
    return `${GO_SHOOT_IMG}/ratchet/${abbr}.png`;
  }
  if (partType === "bit") {
    return `${GO_SHOOT_IMG}/bit/${abbr}.png`;
  }
  return null;
}

function keihinImageFromMeta(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const img = (meta as { img?: unknown }).img;
  if (!Array.isArray(img) || typeof img[0] !== "string") return null;
  return img[0].startsWith("http") ? img[0] : null;
}

/** 整組陀螺／發射器等 variant 的預設圖（優先官方產品照） */
export function goShootVariantImageUrl(variant: {
  youtubeId?: string | null;
  bladeAbbr?: string | null;
  ratchetAbbr?: string | null;
  bitAbbr?: string | null;
  meta?: unknown;
  productCode?: string | null;
}): string | null {
  if (variant.productCode) {
    const productImg = goShootProductImageUrl(variant.productCode);
    if (productImg) return productImg;
  }

  const keihinImg = keihinImageFromMeta(variant.meta);
  if (keihinImg) return keihinImg;

  if (variant.youtubeId) {
    return youtubeThumbnailUrl(variant.youtubeId);
  }

  const bladeAbbr = variant.bladeAbbr?.trim();
  if (bladeAbbr) {
    if (!bladeAbbr.includes(".") && !bladeAbbr.includes(" ")) {
      return `${GO_SHOOT_IMG}/blade/${bladeAbbr}.png`;
    }
    const line = variant.productCode ? inferProductLine(variant.productCode) : null;
    const lastSeg = bladeAbbr.split(".").filter(Boolean).at(-1);
    if (line === "CX" && lastSeg) {
      return `${GO_SHOOT_IMG}/blade/CX/main/${lastSeg}.png`;
    }
  }

  const ratchetAbbr = variant.ratchetAbbr?.trim();
  if (ratchetAbbr && ratchetAbbr !== "=") {
    return `${GO_SHOOT_IMG}/ratchet/${ratchetAbbr}.png`;
  }

  const bitAbbr = variant.bitAbbr?.trim();
  if (bitAbbr) {
    return `${GO_SHOOT_IMG}/bit/${bitAbbr}.png`;
  }

  return null;
}

export { goShootProductImageUrl };

/** go-shoot 資料來源標記（供 UI 顯示） */
export const GO_SHOOT_ATTRIBUTION = `圖片來源：${GO_SHOOT_DB.replace("/db", "")}`;
