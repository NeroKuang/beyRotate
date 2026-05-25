import { GO_SHOOT_DB } from "@/lib/constants";
import {
  inferProductLine,
  ratchetNameZh,
  bitDisplayAbbr,
  bladeSegmentNameZh,
} from "@/lib/catalog/part-names-zh";

type PartEntry = {
  names?: { chi?: string; eng?: string; jap?: string };
  abbr?: string;
  group?: string;
  desc?: string;
  stat?: unknown;
};

type MetaGeneral = {
  blade?: {
    sub?: Record<
      string,
      { delim?: string; "3"?: string[]; "4"?: string[] }
    >;
  };
  bit?: { prefix?: Record<string, { eng?: string; jap?: string; desc?: string }> };
};

type PartsCache = {
  blade: Record<string, PartEntry>;
  divided: Record<string, Record<string, Record<string, PartEntry>>>;
  ratchet: Record<string, PartEntry>;
  bit: Record<string, PartEntry>;
  meta: MetaGeneral;
};

let cache: PartsCache | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${GO_SHOOT_DB}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json() as Promise<T>;
}

function flattenParts(
  raw: Record<string, PartEntry>,
  out: Record<string, PartEntry> = {}
): Record<string, PartEntry> {
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    if (val.names?.chi || val.names?.eng) {
      out[key] = val;
    } else {
      flattenParts(val as Record<string, PartEntry>, out);
    }
  }
  return out;
}

/** 核輪／軸心 JSON 常只有 stat／desc，沒有 names，需用鍵名當縮寫一併收錄 */
function flattenStatParts(
  raw: Record<string, PartEntry>,
  out: Record<string, PartEntry> = {}
): Record<string, PartEntry> {
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    if (val.names?.chi || val.names?.eng) {
      out[key] = val;
    } else if (val.stat !== undefined || val.desc !== undefined) {
      out[key] = val;
    } else {
      flattenStatParts(val as Record<string, PartEntry>, out);
    }
  }
  return out;
}

function indexDivided(
  raw: Record<string, Record<string, Record<string, PartEntry>>>
): Record<string, Record<string, Record<string, PartEntry>>> {
  const out: Record<string, Record<string, Record<string, PartEntry>>> = {};
  for (const [line, groups] of Object.entries(raw)) {
    out[line] = {};
    for (const [group, symbols] of Object.entries(groups)) {
      out[line][group] = symbols;
    }
  }
  return out;
}

export async function loadPartsDb(): Promise<PartsCache> {
  if (cache) return cache;

  const [bladeRaw, dividedRaw, collabRaw, ratchetRaw, bitRaw, metaRaw] =
    await Promise.all([
      fetchJson<Record<string, PartEntry>>("part-blade.json"),
      fetchJson<Record<string, Record<string, Record<string, PartEntry>>>>(
        "part-blade-divided.json"
      ),
      fetchJson<Record<string, PartEntry>>("part-blade-collab.json"),
      fetchJson<Record<string, PartEntry>>("part-ratchet.json"),
      fetchJson<Record<string, PartEntry>>("part-bit.json"),
      fetchJson<Record<string, unknown>>("meta.json"),
    ]);

  const metaList = metaRaw as { general?: MetaGeneral }[] | Record<string, { general?: MetaGeneral }>;
  const general =
    Array.isArray(metaList)
      ? metaList[0]?.general
      : metaList["0"]?.general ?? metaList[0]?.general;

  cache = {
    blade: { ...flattenParts(bladeRaw), ...flattenParts(collabRaw) },
    divided: indexDivided(dividedRaw),
    ratchet: flattenStatParts(ratchetRaw),
    bit: flattenStatParts(bitRaw),
    meta: general ?? {},
  };
  return cache;
}

function lookupFlatBlade(table: Record<string, PartEntry>, abbr: string): string | null {
  const hit = table[abbr];
  return bladeSegmentNameZh(hit);
}

function resolveDividedBlade(
  bladeAbbr: string,
  productCode: string,
  db: PartsCache
): string | null {
  const line = inferProductLine(productCode);
  if (!line || !bladeAbbr.includes(".")) return null;

  const lineData = db.divided[line];
  const sub = db.meta.blade?.sub?.[line];
  if (!lineData || !sub) return null;

  const segments = bladeAbbr.split(".").filter(Boolean);
  const layout = sub[String(segments.length) as "3" | "4"] ?? sub["4"] ?? sub["3"];
  if (!layout) return null;

  const names: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const group = layout[i];
    const sym = segments[i];
    const entry = lineData[group]?.[sym];
    const zh = bladeSegmentNameZh(entry);
    if (zh) names.push(zh);
  }
  return names.length ? names.join(" · ") : null;
}

/** 刃體完整中文名（含 CX 多段如 Em.Mg.H → 帝皇·霸權威能·重型） */
export function resolveBladeNameZh(
  bladeAbbr: string,
  productCode: string,
  db: PartsCache
): string | null {
  const abbr = bladeAbbr.trim();
  if (!abbr) return null;

  const fromDivided = resolveDividedBlade(abbr, productCode, db);
  if (fromDivided) return fromDivided;

  if (abbr.includes(".")) {
    const parts = abbr
      .split(".")
      .map((s) => lookupFlatBlade(db.blade, s))
      .filter((n): n is string => !!n);
    if (parts.length) return parts.join(" · ");
  }

  return lookupFlatBlade(db.blade, abbr);
}

export function resolvePartNames(
  parsed: { bladeAbbr: string; ratchetAbbr: string | null; bitAbbr: string | null },
  productCode: string,
  db: PartsCache
) {
  const bladeNameZh =
    resolveBladeNameZh(parsed.bladeAbbr, productCode, db) ??
    null;

  const ratchetNameZhResolved =
    (parsed.ratchetAbbr && ratchetNameZh(parsed.ratchetAbbr)) ??
    (parsed.ratchetAbbr === "=" ? "標準組合" : null);

  return {
    bladeNameZh,
    ratchetNameZh: ratchetNameZhResolved,
    bitNameZh: bitDisplayAbbr(parsed.bitAbbr),
  };
}
