export const SITE_NAME = "BeyRotate";

export const LISTING_QUOTA = 30;
export const PAGE_SIZE = 36;
export const MAX_LISTING_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_NOTE_LENGTH = 500;
export const MAX_SEEK_TEXT = 500;
export const MAX_MESSAGE_LENGTH = 500;

export const LISTING_TYPES = [
  { value: "sell", label: "出售" },
  { value: "want", label: "徵求" },
  { value: "trade", label: "交換" },
] as const;

export const LISTING_STATUSES = [
  { value: "draft", label: "草稿" },
  { value: "active", label: "上架中" },
  { value: "reserved", label: "已預留" },
  { value: "sold", label: "已售出" },
  { value: "closed", label: "已關閉" },
] as const;

export const CONDITIONS = [
  { value: "new", label: "全新" },
  { value: "like_new", label: "近全新" },
  { value: "used", label: "二手" },
  { value: "parts", label: "零件/缺件" },
] as const;

export function conditionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export const DELIVERY_TAGS = [
  { value: "meetup", label: "面交" },
  { value: "shipping", label: "郵寄" },
  { value: "convenience_store", label: "超商" },
  { value: "mai_huo_bian", label: "賣貨便" },
] as const;

export function deliveryTagLabel(value: string): string {
  return DELIVERY_TAGS.find((t) => t.value === value)?.label ?? value;
}

export const CONTACT_PREFS = [
  { value: "in_app", label: "僅站內私訊" },
  { value: "external", label: "僅外部聯絡" },
  { value: "both", label: "站內 + 外部" },
] as const;

export const STADIUM_TYPES = [
  { value: "xtreme", label: "極限盤" },
  { value: "impact", label: "衝擊盤（一般盤）" },
  { value: "electric", label: "電動盤" },
  { value: "dragon", label: "飛龍盤" },
] as const;

export function stadiumTypeLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return STADIUM_TYPES.find((s) => s.value === value)?.label ?? value;
}

export const REGIONS = [
  { value: "taipei", label: "台北市" },
  { value: "new_taipei", label: "新北市" },
  { value: "taoyuan", label: "桃園市" },
  { value: "taichung", label: "台中市" },
  { value: "tainan", label: "台南市" },
  { value: "kaohsiung", label: "高雄市" },
  { value: "keelung", label: "基隆市" },
  { value: "hsinchu_city", label: "新竹市" },
  { value: "hsinchu_county", label: "新竹縣" },
  { value: "miaoli", label: "苗栗縣" },
  { value: "changhua", label: "彰化縣" },
  { value: "nantou", label: "南投縣" },
  { value: "yunlin", label: "雲林縣" },
  { value: "chiayi_city", label: "嘉義市" },
  { value: "chiayi_county", label: "嘉義縣" },
  { value: "pingtung", label: "屏東縣" },
  { value: "yilan", label: "宜蘭縣" },
  { value: "hualien", label: "花蓮縣" },
  { value: "taitung", label: "台東縣" },
  { value: "penghu", label: "澎湖縣" },
  { value: "kinmen", label: "金門縣" },
  { value: "lienchiang", label: "連江縣" },
  { value: "overseas", label: "海外" },
] as const;

export function regionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export const REPORT_REASONS = [
  { value: "scam", label: "詐騙／詐騙嫌疑" },
  { value: "fake", label: "假貨" },
  { value: "harassment", label: "騷擾" },
  { value: "spam", label: "重複洗版" },
  { value: "bad_price", label: "不實價格" },
  { value: "prohibited", label: "違禁品" },
  { value: "other", label: "其他" },
] as const;

export const GO_SHOOT_DB = "https://go-shoot.github.io/x/db";
