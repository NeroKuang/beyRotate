import { describe, it, expect } from "vitest";
import { buildVariantDisplayLabel } from "../display-label";

describe("buildVariantDisplayLabel", () => {
  it("joins all segments with ·", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-01",
      packageType: "S",
      bladeNameZh: "巫師矢",
      ratchetAbbr: "4-60",
      bitAbbr: "FB",
      coat: null,
    });
    expect(result).toBe("BX-01 · 入門組（附發射器） · 巫師矢 · 4-60 · FB");
  });

  it("uses packageLabelZh override when provided", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-02",
      packageType: "B",
      packageLabelZh: "自訂包裝名",
      bladeNameZh: "帝皇刃",
      ratchetAbbr: "3-70",
      bitAbbr: "HN",
      coat: null,
    });
    expect(result).toBe("BX-02 · 自訂包裝名 · 帝皇刃 · 3-70 · HN");
  });

  it("includes coat when present", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-03",
      packageType: "B",
      bladeNameZh: null,
      ratchetAbbr: null,
      bitAbbr: null,
      coat: "Black",
    });
    expect(result).toBe("BX-03 · 補充包（單陀螺） · 黑色");
  });

  it("reads coat from meta as fallback", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-04",
      packageType: "B",
      bladeNameZh: null,
      ratchetAbbr: null,
      bitAbbr: null,
      coat: null,
      meta: { coat: "Crimson" },
    });
    expect(result).toBe("BX-04 · 補充包（單陀螺） · 深紅");
  });

  it("omits null segments", () => {
    const result = buildVariantDisplayLabel({
      code: "CX-11",
      packageType: "B",
      bladeNameZh: null,
      ratchetAbbr: null,
      bitAbbr: null,
      coat: null,
    });
    expect(result).toBe("CX-11 · 補充包（單陀螺）");
  });

  it("handles ratchet = sign as 標準組合", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-05",
      packageType: "S",
      bladeNameZh: "虎牙",
      ratchetAbbr: "=",
      bitAbbr: "FB",
      coat: null,
    });
    expect(result).toBe("BX-05 · 入門組（附發射器） · 虎牙 · 標準組合 · FB");
  });

  it("filters out invalid bit abbreviations", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-06",
      packageType: "S",
      bladeNameZh: "烈風",
      ratchetAbbr: "4-60",
      bitAbbr: "/",
      bitNameZh: "特殊型",
      coat: null,
    });
    expect(result).toBe("BX-06 · 入門組（附發射器） · 烈風 · 4-60 · 特殊型");
  });

  it("falls back to ratchetNameZh when ratchetAbbr is null", () => {
    const result = buildVariantDisplayLabel({
      code: "BX-07",
      packageType: "B",
      bladeNameZh: "龍爪",
      ratchetAbbr: null,
      ratchetNameZh: "固定軸心",
      bitAbbr: null,
      coat: null,
    });
    expect(result).toBe("BX-07 · 補充包（單陀螺） · 龍爪 · 固定軸心");
  });
});
