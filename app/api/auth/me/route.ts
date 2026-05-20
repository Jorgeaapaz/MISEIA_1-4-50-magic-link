import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

interface SessionPayload {
  userId: string;
  email: string;
  purpose: string;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken<SessionPayload>(token);

    if (payload.purpose !== "session") {
      return Response.json({ error: "Token invalido" }, { status: 401 });
    }

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    return Response.json({
      user: {
        userId: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
}
