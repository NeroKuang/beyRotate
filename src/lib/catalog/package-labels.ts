/** go-shoot 包裝類型（純中文，對應 products.js Filter） */
const PKG_ZH: Record<string, string> = {
  S: "入門組（附發射器）",
  B: "補充包（單陀螺）",
  St: "套組（至少兩枚陀螺）",
  SS: "對戰盤組（含對戰盤）",
  RB: "隨機抽包",
  Lm: "官方未收錄",
};

const PKG_ZH_HIDDEN: Record<string, string> = {
  "S H": "入門組 · 異色版",
  "B H": "補充包 · 異色版",
  "St H": "套組 · 異色版",
  "SS H": "對戰盤組 · 異色版",
  "RB H": "隨機抽包 · 異色版",
  "Lm H": "官方未收錄 · 異色版",
};

export function packageLabelZh(pkg: string | null | undefined): string {
  const p = (pkg ?? "").trim();
  if (!p) return "品項";
  return PKG_ZH_HIDDEN[p] ?? PKG_ZH[p] ?? p;
}
