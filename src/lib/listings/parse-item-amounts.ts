export function parseItemAmounts(formData: FormData, field: string): number[] {
  return formData.getAll(field).map((v) => {
    const n = parseInt(String(v), 10);
    if (!Number.isFinite(n) || n < 1 || n > 999_999) return NaN;
    return n;
  });
}

export function validateItemAmounts(
  amounts: number[],
  count: number
): amounts is number[] {
  if (amounts.length !== count) return false;
  return amounts.every((n) => !Number.isNaN(n));
}

export function listingSellPriceFromItems(amounts: number[]): number | null {
  if (!amounts.length || amounts.some(Number.isNaN)) return null;
  return Math.min(...amounts);
}

export function listingWantBudgetFromItems(amounts: number[]): number | null {
  if (!amounts.length || amounts.some(Number.isNaN)) return null;
  return Math.max(...amounts);
}
