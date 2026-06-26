import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { signToken } from "@/lib/jwt";

const { mockFindOneAndUpdate } = vi.hoisted(() => ({
  mockFindOneAndUpdate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      findOneAndUpdate: mockFindOneAndUpdate,
    }),
  }),
}));

import { GET } from "@/app/api/auth/verify/route";

const userId = "507f1f77bcf86cd799439011";
const userEmail = "user@example.com";

const mockUser = {
  _id: new ObjectId(userId),
  email: userEmail,
};

function makeMagicLinkToken(overrides: object = {}) {
  return signToken({ email: userEmail, purpose: "magic-link", ...overrides }, "15m");
}

function makeNextRequest(token?: string) {
  const url = token
    ? `http://localhost:3000/api/auth/verify?token=${token}`
    : "http://localhost:3000/api/auth/verify";

  const req = new Request(url) as Request & { nextUrl: URL };
  (req as unknown as { nextUrl: URL }).nextUrl = new URL(url);
  return req as Parameters<typeof GET>[0];
}

describe("GET /api/auth/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOneAndUpdate.mockResolvedValue(mockUser);
  });

  it("returns 400 when no token is provided", async () => {
    const res = await GET(makeNextRequest());
    expect(res.status).toBe(400);
  });

  it("returns 401 for an invalid/tampered token", async () => {
    const res = await GET(makeNextRequest("totally.invalid.token"));
    expect(res.status).toBe(401);
  });

  it("returns 401 for a token with wrong purpose", async () => {
    const token = signToken({ email: userEmail, purpose: "session" }, "1h");
    const res = await GET(makeNextRequest(token));
    expect(res.status).toBe(401);
  });

  it("returns 401 when user is not found in the database", async () => {
    mockFindOneAndUpdate.mockResolvedValue(null);
    const token = makeMagicLinkToken();
    const res = await GET(makeNextRequest(token));
    expect(res.status).toBe(401);
  });

  it("returns 200 with a session token for a valid magic link token", async () => {
    const token = makeMagicLinkToken();
    const res = await GET(makeNextRequest(token));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe(userEmail);
  });

  it("issues a session token (purpose: session) in the response", async () => {
    const token = makeMagicLinkToken();
    const res = await GET(makeNextRequest(token));
    const body = await res.json();

    const { verifyToken } = await import("@/lib/jwt");
    const payload = verifyToken<{ purpose: string }>(body.token);
    expect(payload.purpose).toBe("session");
  });
});
