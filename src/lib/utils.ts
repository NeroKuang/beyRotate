import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function hotScore(viewCount: number, publishedAt: string | null): number {
  if (!publishedAt) return 0;
  const days =
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  return viewCount / Math.pow(1 + days, 1.5);
}
