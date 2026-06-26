import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      updateOne: vi.fn().mockResolvedValue({ upsertedId: null }),
    }),
  }),
}));

vi.mock("@/lib/mail", () => ({
  sendMagicLinkEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/jwt", () => ({
  signToken: vi.fn().mockReturnValue("mocked-jwt-token"),
}));

import { POST } from "@/app/api/auth/send-magic-link/route";
import { sendMagicLinkEmail } from "@/lib/mail";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/auth/send-magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/send-magic-link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and sends the magic link for a valid email", async () => {
    const req = makeRequest({ email: "user@example.com" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBeDefined();
    expect(sendMagicLinkEmail).toHaveBeenCalledOnce();
  });

  it("normalises email to lowercase before sending", async () => {
    const req = makeRequest({ email: "USER@EXAMPLE.COM" });
    await POST(req);

    expect(sendMagicLinkEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String)
    );
  });

  it("returns 400 for a missing email field", async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(sendMagicLinkEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed email address", async () => {
    const req = makeRequest({ email: "not-an-email" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(sendMagicLinkEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for an email without domain", async () => {
    const req = makeRequest({ email: "user@" });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
