import { bladeSegmentNameZh, bitDisplayAbbr } from "@/lib/catalog/part-names-zh";
import { ratchetDisplayZh } from "@/lib/catalog/ratchet-search";

type PartEntry = {
  names?: { chi?: string; eng?: string; jap?: string };
  stat?: unknown;
  desc?: string;
};

/** 輔助戰刃等單字母代號：只顯示 F、H，不展開成「自由型」「重型」 */
export function useAssistLetterLabel(partGroup: string): boolean {
  return partGroup === "assist";
}

export function catalogPartNameZh(
  partType: string,
  partGroup: string,
  abbr: string,
  entry?: PartEntry
): string {
  if (partType === "bit") return bitDisplayAbbr(abbr) ?? abbr.toUpperCase();
  if (partType === "ratchet") return ratchetDisplayZh(abbr) ?? abbr;

  if (useAssistLetterLabel(partGroup)) return abbr;

  const zh = bladeSegmentNameZh(entry);
  if (zh) return zh;

  return abbr;
}

/** BX／UX 主要戰刃：搜尋用（含縮寫、英文、中文） */
export function buildMainBladeSearchText(abbr: string, entry?: PartEntry): string {
  const zh = bladeSegmentNameZh(entry);
  const eng = entry?.names?.eng?.replace(/\\/g, " ");
  const chi = entry?.names?.chi?.replace(/\\/g, " ").replace(/⬧/g, " ");
  return [abbr, eng, zh, chi].filter(Boolean).join(" ");
}

export function buildPartSearchText(
  partType: string,
  partGroup: string,
  abbr: string,
  nameZh: string,
  extra: string[] = []
): string {
  return [abbr, nameZh, ...extra].filter(Boolean).join(" ");
}
