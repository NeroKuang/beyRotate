import { isValidBitAbbr } from "@/lib/catalog/part-names-zh";

/** 解析 go-shoot 組裝字串（blade ratchet bit，空白分隔） */
export type ParsedBuild = {
  bladeAbbr: string;
  ratchetAbbr: string | null;
  bitAbbr: string | null;
};

function isRatchetToken(s: string): boolean {
  return /^([0-9M]+-\d+|=)$/.test(s.trim());
}

export function parseBuildString(build: string): ParsedBuild {
  const parts = build.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { bladeAbbr: "", ratchetAbbr: null, bitAbbr: null };
  }
  if (parts.length === 1) {
    return { bladeAbbr: parts[0], ratchetAbbr: null, bitAbbr: null };
  }
  if (parts.length === 2) {
    const [a, b] = parts;
    if (isRatchetToken(b)) {
      return { bladeAbbr: a, ratchetAbbr: b, bitAbbr: null };
    }
    if (isValidBitAbbr(b)) {
      return { bladeAbbr: a, ratchetAbbr: null, bitAbbr: b };
    }
    return { bladeAbbr: a, ratchetAbbr: b, bitAbbr: null };
  }

  let ratchetAbbr = parts.at(-2) ?? null;
  let bitAbbr = parts.at(-1) ?? null;
  let bladeParts = parts.slice(0, -2);

  if (!isValidBitAbbr(bitAbbr)) {
    bitAbbr = null;
    if (isValidBitAbbr(ratchetAbbr)) {
      bitAbbr = ratchetAbbr;
      ratchetAbbr = null;
      bladeParts = parts.slice(0, -1);
    } else if (!isRatchetToken(ratchetAbbr ?? "")) {
      ratchetAbbr = null;
      bladeParts = parts;
    }
  }

  if (ratchetAbbr && !isRatchetToken(ratchetAbbr) && !isValidBitAbbr(ratchetAbbr)) {
    ratchetAbbr = null;
  }

  return {
    bladeAbbr: bladeParts.join(" "),
    ratchetAbbr,
    bitAbbr: bitAbbr && isValidBitAbbr(bitAbbr) ? bitAbbr : null,
  };
}
