import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, ensureConsent } from "@/db/queries";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim();
  const password = body?.password || "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet e-mail." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(email, passwordHash);
  ensureConsent(user.id);
  await createSession(user.id);

  return NextResponse.json({ ok: true, userId: user.id });
}
