/** 搜尋關鍵字展開：產品編號格式、常見別字 */

const CODE_PREFIXES = ["BXG", "BXA", "BXC", "BXH", "BX", "CX", "UX"] as const;

/** 使用者常打別字，一併搜尋資料庫用字 */
const TERM_ALIASES: Record<string, string[]> = {
  帝王: ["帝王", "帝皇"],
  帝皇: ["帝皇", "帝王"],
  霸權: ["霸權", "霸權威能"],
};

export function expandCatalogSearchTerms(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const terms = new Set<string>();
  terms.add(trimmed);

  const upper = trimmed.toUpperCase().replace(/\s+/g, "");
  terms.add(upper);

  for (const prefix of CODE_PREFIXES) {
    const re = new RegExp(`^${prefix}-?(\\d{1,3})$`, "i");
    const m = upper.match(re);
    if (m) {
      terms.add(`${prefix}-${m[1]}`);
      terms.add(`${prefix}${m[1]}`);
    }
  }

  for (const [key, aliases] of Object.entries(TERM_ALIASES)) {
    if (trimmed.includes(key)) {
      for (const a of aliases) terms.add(trimmed.replace(key, a));
      for (const a of aliases) terms.add(a);
    }
  }

  return [...terms].filter(Boolean);
}
