import { describe, it, expect } from "vitest";
import { listingExpiresAt, isPublishedListingExpired } from "./listing-expiry";

describe("listingExpiresAt", () => {
  it("adds 14 days from publishedAt", () => {
    const published = new Date("2026-01-01T12:00:00Z");
    const exp = listingExpiresAt(published);
    expect(exp?.toISOString()).toBe("2026-01-15T12:00:00.000Z");
  });

  it("returns null when no publish date", () => {
    expect(listingExpiresAt(null)).toBeNull();
  });
});

describe("isPublishedListingExpired", () => {
  it("is true when past TTL for active listing", () => {
    const old = new Date();
    old.setDate(old.getDate() - 20);
    expect(isPublishedListingExpired(old, "active")).toBe(true);
  });

  it("is false for closed listing", () => {
    const old = new Date();
    old.setDate(old.getDate() - 20);
    expect(isPublishedListingExpired(old, "closed")).toBe(false);
  });
});
