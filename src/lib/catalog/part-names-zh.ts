/** 軸心／零件英文類型 → 中文全名（go-shoot part-bit 多無 chi） */
/** 常見軸心縮寫（JSON 無 chi 時使用） */
const BIT_ABBR_ZH: Record<string, string> = {
  FB: "平球型",
  GB: "球型",
  WB: "壁球型",
  HN: "高尖型",
  LF: "低平型",
  GF: "齒輪平型",
  UF: "超低平型",
  FF: "平射型",
  RA: "橡膠攻擊型",
  DB: "圓盤型",
  Op: "操作型",
};

const BIT_ENG_ZH: Record<string, string> = {
  Operate: "操作型",
  Bound: "波動型",
  Free: "自由型",
  Disk: "圓盤型",
  Gear: "齒輪型",
  High: "高型",
  Low: "低型",
  Metal: "金屬型",
  Rubber: "橡膠型",
  Trans: "變換型",
  Under: "超低型",
  Wall: "壁型",
  Heavy: "重型",
  Emperor: "帝皇",
  Might: "霸權威能",
};

const BLADE_ENG_ZH: Record<string, string> = {
  Heavy: "重型",
  Emperor: "帝皇",
  Might: "霸權威能",
};

const COAT_EN: Record<string, string> = {
  Black: "黑色",
  Crimson: "深紅",
  BlueViolet: "藍紫",
  DarkOrange: "深橙",
  MediumSeaGreen: "海綠",
};

export function coatZh(coat: string | null | undefined): string | null {
  if (!coat) return null;
  return COAT_EN[coat] ?? coat;
}

/** 產品碼推測系列（BX / CX / UX …） */
export function inferProductLine(code: string): string | null {
  const m = code.match(/^(BXG|BXA|BX|CX|UX)/i);
  if (!m) return null;
  const raw = m[1].toUpperCase();
  if (raw.startsWith("BX")) return "BX";
  return raw;
}

export function ratchetNameZh(abbr: string | null | undefined): string | null {
  if (!abbr || abbr === "=") return abbr === "=" ? "標準組合" : null;
  const raw = abbr.trim();
  // 4-60、3-70 等：直接顯示規格碼，不展開成「四刃 · 高度 60」
  if (/^\d+-\d+$/.test(raw)) {
    return raw;
  }
  if (/^[A-Za-z]+-\d+$/.test(raw)) {
    return `固鎖輪盤 ${raw.replace("-", " · 高度 ")}`;
  }
  return `固鎖輪盤 ${raw}`;
}

/** 軸心是否為有效英文縮寫（排除 /、+ 等佔位符） */
export function isValidBitAbbr(abbr: string | null | undefined): boolean {
  if (!abbr) return false;
  const t = abbr.trim();
  if (!t || t === "/" || t === "+") return false;
  return /^[A-Za-z][A-Za-z0-9]{0,2}$/.test(t);
}

/** 軸心顯示：一律用英文縮寫（FB、MN、LR…） */
export function bitDisplayAbbr(abbr: string | null | undefined): string | null {
  if (!isValidBitAbbr(abbr)) return null;
  const t = abbr!.trim();
  return t.length <= 3 ? t.toUpperCase() : t;
}

/** @deprecated 刊登／目錄軸心請用 bitDisplayAbbr */
export function bitNameZh(
  abbr: string | null | undefined,
  entry?: { names?: { chi?: string; eng?: string; jap?: string } }
): string | null {
  return bitDisplayAbbr(abbr);
}

export function bladeSegmentNameZh(entry?: {
  names?: { chi?: string; eng?: string; jap?: string };
}): string | null {
  if (!entry) return null;
  if (entry.names?.chi) {
    return entry.names.chi.replace(/⬧/g, " · ").replace(/\s+/g, " ").trim();
  }
  const eng = entry.names?.eng;
  if (eng && BLADE_ENG_ZH[eng]) return BLADE_ENG_ZH[eng];
  if (eng && BIT_ENG_ZH[eng]) return BIT_ENG_ZH[eng];
  return null;
}
