import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/db/queries";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim();
  const password = body?.password || "";

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "Identifiants incorrects." },
      { status: 401 }
    );
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Identifiants incorrects." },
      { status: 401 }
    );
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
