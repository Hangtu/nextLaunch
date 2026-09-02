import { describe, it, expect, vi, afterEach } from "vitest";

import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

// No UPSTASH_* vars are set in the test environment, so these exercise the
// in-memory fallback path — see docs/patterns-and-gotchas.md.
describe("checkRateLimit (in-memory fallback)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", async () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(await checkRateLimit(id, { maxRequests: 3, windowMs: 1000 })).toBe(
        true
      );
    }
  });

  it("blocks requests once the limit is exceeded within the window", async () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(id, { maxRequests: 3, windowMs: 1000 });
    }
    expect(await checkRateLimit(id, { maxRequests: 3, windowMs: 1000 })).toBe(
      false
    );
  });

  it("resets once the window elapses", async () => {
    vi.useFakeTimers();
    const id = `test-${Math.random()}`;

    expect(await checkRateLimit(id, { maxRequests: 1, windowMs: 1000 })).toBe(
      true
    );
    expect(await checkRateLimit(id, { maxRequests: 1, windowMs: 1000 })).toBe(
      false
    );

    vi.advanceTimersByTime(1001);

    expect(await checkRateLimit(id, { maxRequests: 1, windowMs: 1000 })).toBe(
      true
    );
  });

  it("tracks separate identifiers independently", async () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    await checkRateLimit(a, { maxRequests: 1, windowMs: 1000 });
    expect(await checkRateLimit(a, { maxRequests: 1, windowMs: 1000 })).toBe(
      false
    );
    expect(await checkRateLimit(b, { maxRequests: 1, windowMs: 1000 })).toBe(
      true
    );
  });
});

describe("getClientIdentifier", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIdentifier(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIdentifier(headers)).toBe("9.9.9.9");
  });

  it("returns 'unknown' when neither header is present", () => {
    expect(getClientIdentifier(new Headers())).toBe("unknown");
  });
});
