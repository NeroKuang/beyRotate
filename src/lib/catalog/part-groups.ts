/** 刊登／搜尋用的部件槽位（對齊 go-shoot meta + 官方中文稱呼） */

export const PART_GROUP_LABEL: Record<string, string> = {
  chip: "固鎖／紋章",
  over: "超越戰刃",
  main: "主要戰刃",
  metal: "鋼鐵戰刃",
  assist: "輔助戰刃",
};

export const PART_TYPE_LABEL: Record<string, string> = {
  ratchet: "固鎖輪盤",
  bit: "軸心",
};

export type PartSlot = {
  part_type: string;
  part_group: string;
  label: string;
};

/** CX 專用刃體槽位 */
const CX_BLADE_SLOTS: PartSlot[] = [
  { part_type: "blade", part_group: "chip", label: PART_GROUP_LABEL.chip },
  { part_type: "blade", part_group: "over", label: PART_GROUP_LABEL.over },
  { part_type: "blade", part_group: "main", label: `${PART_GROUP_LABEL.main}（CX）` },
  { part_type: "blade", part_group: "assist", label: PART_GROUP_LABEL.assist },
];

/** 共用槽位（不再區分 BX／UX／CX 系列分頁） */
export const ALL_PART_SLOTS: PartSlot[] = [
  ...CX_BLADE_SLOTS,
  { part_type: "blade", part_group: "main", label: `${PART_GROUP_LABEL.main}（BX／UX）` },
  { part_type: "ratchet", part_group: "", label: PART_TYPE_LABEL.ratchet },
  { part_type: "bit", part_group: "", label: PART_TYPE_LABEL.bit },
];

export function slotLabel(partType: string, partGroup: string): string {
  if (partType === "ratchet") return PART_TYPE_LABEL.ratchet;
  if (partType === "bit") return PART_TYPE_LABEL.bit;
  return PART_GROUP_LABEL[partGroup] ?? partGroup;
}

/** 依槽位篩選時的 series_scope（CX 的 main 與 BX 的 main 同 part_group，靠 scope 區分） */
export function seriesScopesForSlot(slot: PartSlot): string[] | undefined {
  if (slot.part_type === "blade" && slot.part_group === "main") {
    return slot.label.includes("CX") ? ["cx"] : ["bx_ux"];
  }
  if (
    slot.part_type === "blade" &&
    ["chip", "over", "assist", "metal"].includes(slot.part_group)
  ) {
    return ["cx"];
  }
  if (slot.part_type === "ratchet" || slot.part_type === "bit") {
    return ["all"];
  }
  return undefined;
}
