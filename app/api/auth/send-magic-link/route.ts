import { getDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { sendMagicLinkEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email invalido" }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = email.toLowerCase().trim();

    await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $setOnInsert: { email: normalizedEmail, createdAt: new Date() },
        $set: {},
      },
      { upsert: true }
    );

    const token = signToken({ email: normalizedEmail, purpose: "magic-link" }, "15m");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLink = `${appUrl}/auth/verify?token=${token}`;

    await sendMagicLinkEmail(normalizedEmail, magicLink);

    return Response.json({ message: "Magic link enviado" });
  } catch {
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
