import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { signToken } from "@/lib/jwt";

const { mockFindOne } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      findOne: mockFindOne,
    }),
  }),
}));

import { GET } from "@/app/api/auth/me/route";

const userId = "507f1f77bcf86cd799439011";
const userEmail = "user@example.com";

const mockUser = {
  _id: new ObjectId(userId),
  email: userEmail,
  createdAt: new Date("2026-01-01"),
  lastLoginAt: new Date("2026-06-01"),
};

function makeSessionToken(overrides: object = {}) {
  return signToken(
    { userId, email: userEmail, purpose: "session", ...overrides },
    "1h"
  );
}

function makeRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader) headers["authorization"] = authHeader;
  return new Request("http://localhost:3000/api/auth/me", { headers });
}

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne.mockResolvedValue(mockUser);
  });

  it("returns 401 when no Authorization header is provided", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when the Authorization header is malformed", async () => {
    const res = await GET(makeRequest("Token abc123"));
    expect(res.status).toBe(401);
  });

  it("returns 401 for a token with wrong purpose", async () => {
    const token = signToken({ userId, email: userEmail, purpose: "magic-link" }, "1h");
    const res = await GET(makeRequest(`Bearer ${token}`));
    expect(res.status).toBe(401);
  });

  it("returns 200 with user data for a valid session token", async () => {
    const token = makeSessionToken();
    const res = await GET(makeRequest(`Bearer ${token}`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe(userEmail);
    expect(body.user.userId).toBe(userId);
  });
});
