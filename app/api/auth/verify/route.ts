import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, signToken } from "@/lib/jwt";

interface MagicLinkPayload {
  email: string;
  purpose: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token requerido" }, { status: 400 });
    }

    const payload = verifyToken<MagicLinkPayload>(token);

    if (payload.purpose !== "magic-link") {
      return Response.json({ error: "Token invalido" }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
      { email: payload.email },
      { $set: { lastLoginAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const sessionToken = signToken(
      {
        userId: user._id.toString(),
        email: user.email,
        purpose: "session",
      },
      "7d"
    );

    return Response.json({
      token: sessionToken,
      user: { userId: user._id.toString(), email: user.email },
    });
  } catch {
    return Response.json({ error: "Token invalido o expirado" }, { status: 401 });
  }
}
