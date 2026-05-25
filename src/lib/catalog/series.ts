/** go-shoot 產品系列（對應 products 頁說明與編號前綴） */

export type ProductSeriesId =
  | "bx"
  | "cx"
  | "ux"
  | "bxg"
  | "bxa"
  | "bxc"
  | "bxh"
  | "other";

export const PRODUCT_SERIES: {
  id: ProductSeriesId;
  label: string;
  short: string;
  description: string;
}[] = [
  {
    id: "bx",
    label: "BX 基本系列",
    short: "BX",
    description: "Basic Line · 編號 BX-01～",
  },
  {
    id: "cx",
    label: "CX 自訂系列",
    short: "CX",
    description: "Custom Line · 編號 CX-01～",
  },
  {
    id: "ux",
    label: "UX 獨特系列",
    short: "UX",
    description: "Unique Line · 編號 UX-01～",
  },
  {
    id: "bxg",
    label: "BXG 限定系列",
    short: "BXG",
    description: "各種限定 GENTEI · 編號 BXG-01～",
  },
  {
    id: "bxa",
    label: "BXA 海外系列",
    short: "BXA",
    description: "日本以外亞洲地區 · 編號 BXA-01～",
  },
  {
    id: "bxc",
    label: "BXC 聯名系列",
    short: "BXC",
    description: "コロコロ COROCORO 雜誌相關 · 編號 BXC-01～",
  },
  {
    id: "bxh",
    label: "BXH 非賣品系列",
    short: "BXH",
    description: "贈品・比賽獎品等非売品 · 編號 BXH-01～",
  },
];

export function inferProductSeries(code: string): ProductSeriesId {
  const c = code.trim().toUpperCase();
  if (c.startsWith("BXG")) return "bxg";
  if (c.startsWith("BXA")) return "bxa";
  if (c.startsWith("BXC")) return "bxc";
  if (c.startsWith("BXH")) return "bxh";
  if (c.startsWith("CX")) return "cx";
  if (c.startsWith("UX")) return "ux";
  if (c.startsWith("BX")) return "bx";
  return "other";
}

export function seriesLabel(id: ProductSeriesId): string {
  return PRODUCT_SERIES.find((s) => s.id === id)?.label ?? id;
}
