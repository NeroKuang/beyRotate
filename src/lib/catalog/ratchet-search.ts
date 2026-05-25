/** 固鎖輪盤規格碼（刃數-高度）搜尋與中文別名 */

const CN_DIGIT: Record<string, string> = {
  零: "0",
  一: "1",
  二: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
  七: "7",
  八: "8",
  九: "9",
};

const DIGIT_CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function bladeCountZh(blades: string): string {
  if (blades.toUpperCase() === "M") return "M";
  const n = parseInt(blades, 10);
  if (!Number.isNaN(n) && n >= 0 && n <= 9) return DIGIT_CN[n];
  return blades;
}

function cnDigitToArabic(s: string): string | null {
  if (/^\d+$/.test(s)) return s;
  if (s.length === 1 && CN_DIGIT[s]) return CN_DIGIT[s];
  return null;
}

/** 解析使用者輸入 → 規格碼如 7-60；僅刃數時回傳 bladesPrefix 如 7- */
export type RatchetQueryMatch =
  | { kind: "code"; code: string }
  | { kind: "prefix"; prefix: string };

export function parseRatchetQuery(raw: string): RatchetQueryMatch | null {
  const t = raw.trim().replace(/\s+/g, "");
  if (!t) return null;

  const direct = t.match(/^([0-9M]+)\s*[-–—]\s*([0-9]+)$/i);
  if (direct) {
    const blades = direct[1].toUpperCase();
    const height = direct[2];
    return { kind: "code", code: `${blades}-${height}` };
  }

  const bladeHeight = t.match(
    /^([0-9M]|[零一二三四五六七八九])刃(?:高度)?([0-9]+)$/i
  );
  if (bladeHeight) {
    const blades = cnDigitToArabic(bladeHeight[1]);
    if (blades) return { kind: "code", code: `${blades.toUpperCase()}-${bladeHeight[2]}` };
  }

  const bladeOnly = t.match(/^([0-9M]|[零一二三四五六七八九])刃$/i);
  if (bladeOnly) {
    const blades = cnDigitToArabic(bladeOnly[1]);
    if (blades) return { kind: "prefix", prefix: `${blades.toUpperCase()}-` };
  }

  return null;
}

/** 單一規格碼的所有可搜尋別名 */
export function buildRatchetSearchAliases(abbr: string): string[] {
  const m = abbr.match(/^([0-9M]+)-([0-9]+)$/i);
  if (!m) return [abbr];

  const blades = m[1].toUpperCase();
  const height = m[2];
  const bZh = bladeCountZh(blades);
  const code = `${blades}-${height}`;

  return [
    code,
    `${blades}${height}`,
    `${blades}刃${height}`,
    `${blades}刃高度${height}`,
    `${bZh}刃${height}`,
    `${bZh}刃高度${height}`,
    `${bZh}刃 高度 ${height}`,
    `固鎖輪盤${code}`,
    `固鎖輪盤 ${code}`,
    `核輪${code}`,
  ];
}

/** 核輪顯示用中文（含規格碼與刃數／高度說明） */
export function ratchetDisplayZh(abbr: string): string {
  const m = abbr.match(/^([0-9M]+)-([0-9]+)$/i);
  if (!m) return ratchetNameZhFallback(abbr);

  const blades = m[1].toUpperCase();
  const height = m[2];
  const code = `${blades}-${height}`;
  const bZh = bladeCountZh(blades);
  return `${code}（${bZh}刃 · 高度 ${height}）`;
}

function ratchetNameZhFallback(abbr: string): string {
  if (abbr === "=") return "標準組合";
  if (/^[A-Za-z]+-\d+$/i.test(abbr)) {
    return `固鎖輪盤 ${abbr.replace("-", " · 高度 ")}`;
  }
  return `固鎖輪盤 ${abbr}`;
}

/** 將使用者查詢展開成多個搜尋字串（含 7-60、七刃高度60 等） */
export function expandRatchetSearchTerms(raw: string): string[] {
  const trimmed = raw.trim();
  const terms = new Set<string>();
  if (trimmed) terms.add(trimmed);

  const parsed = parseRatchetQuery(trimmed);
  if (parsed?.kind === "code") {
    terms.add(parsed.code);
    for (const a of buildRatchetSearchAliases(parsed.code)) terms.add(a);
  }

  return [...terms];
}
