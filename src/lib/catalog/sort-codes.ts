/** 產品編號自然排序（BX-2 在 BX-10 前） */
export function compareProductCode(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

export function sortProductCodes(codes: string[]): string[] {
  return [...codes].sort(compareProductCode);
}
