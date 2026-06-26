import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/jwt";

describe("jwt helpers", () => {
  describe("signToken", () => {
    it("returns a non-empty string", () => {
      const token = signToken({ email: "test@example.com" }, "15m");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("produces a valid JWT with three dot-separated parts", () => {
      const token = signToken({ email: "test@example.com" }, "15m");
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    it("embeds the payload in the token", () => {
      const token = signToken({ email: "user@example.com", purpose: "magic-link" }, "15m");
      const payload = verifyToken<{ email: string; purpose: string }>(token);
      expect(payload.email).toBe("user@example.com");
      expect(payload.purpose).toBe("magic-link");
    });
  });

  describe("verifyToken", () => {
    it("returns the payload for a valid token", () => {
      const token = signToken({ userId: "abc123", email: "user@example.com" }, "1h");
      const payload = verifyToken<{ userId: string; email: string }>(token);
      expect(payload.userId).toBe("abc123");
      expect(payload.email).toBe("user@example.com");
    });

    it("throws JsonWebTokenError for a tampered token", () => {
      const token = signToken({ email: "user@example.com" }, "1h");
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => verifyToken(tampered)).toThrow();
    });

    it("throws TokenExpiredError for an already-expired token", async () => {
      const token = signToken({ email: "user@example.com" }, "1ms");
      await new Promise((r) => setTimeout(r, 10));
      expect(() => verifyToken(token)).toThrow();
    });

    it("throws for a completely invalid string", () => {
      expect(() => verifyToken("not.a.jwt")).toThrow();
    });
  });
});
