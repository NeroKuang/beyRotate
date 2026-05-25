/** Takara Tomy 官方產品包裝照（對齊 go-shoot products/maps.js + bey.js） */
const TAKARA_LINEUP_IMAGE =
  "https://beyblade.takaratomy.co.jp/beyblade-x/lineup/_image";

type MapObject = {
  alias?: string;
  _?: boolean;
};

/** go-shoot Maps.images 精簡（僅影響主圖的 alias / twitter / _） */
const PRODUCT_IMAGE_MAP: Record<string, MapObject | string[]> = {
  "BXG-50": { alias: "BX00_bit_silver_white" },
  "BXG-25": { alias: "BXA-02" },
  "BXG-17": { alias: "BXG_bit01" },
  "BXG-14": { alias: "BXG-09" },
  "BXG-12": { alias: "BXG-00" },
  "BXG-09": { alias: "BXG-14" },
  "BXG-07": { _: true },
  "BXA-03": ["HGXKuyobQAAhnhs", "HGXKuyobsAAtyvi"],
  "BXA-04": ["HGXKuyzaAAIiYO7", "HGXKuyTaEAAWha-"],
  "BXA-05": ["HGXMoV8aIAAOqFD", "HGXMoV3aAAEwAbp"],
  "BXA-06": ["HGXMoV2aAAEyHph", "HGXMoV7aAAMOKKm"],
};

function twitterProductImageUrl(mediaId: string): string {
  return `https://pbs.twimg.com/media/${mediaId}?format=jpg&name=large`;
}

/** 產品編號 → Takara 主圖檔名 stem（如 BX-49 → BX49） */
export function takaraProductImageStem(productCode: string): string {
  const code = productCode.trim();
  const entry = PRODUCT_IMAGE_MAP[code] ?? PRODUCT_IMAGE_MAP[code.toUpperCase()];

  if (Array.isArray(entry)) {
    return code.replace("-", "");
  }

  const alias = entry && !Array.isArray(entry) ? entry.alias : undefined;
  const useUnderscore = entry && !Array.isArray(entry) ? entry._ === true : false;
  const stem = alias ?? code;
  return stem.replace("-", useUnderscore ? "_" : "");
}

/** 官方產品包裝照 URL；BXA 等 twitter 圖優先 */
export function goShootProductImageUrl(productCode: string): string | null {
  const code = productCode.trim();
  if (!code) return null;

  const entry = PRODUCT_IMAGE_MAP[code] ?? PRODUCT_IMAGE_MAP[code.toUpperCase()];
  if (Array.isArray(entry) && typeof entry[0] === "string") {
    return twitterProductImageUrl(entry[0]);
  }

  const stem = takaraProductImageStem(code);
  return `${TAKARA_LINEUP_IMAGE}/${stem}@1.png`;
}
