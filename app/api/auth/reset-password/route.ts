import { NextRequest, NextResponse } from "next/server";
import { getUserByResetToken, resetPassword } from "@/db/queries";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token || "";
  const password = body?.password || "";

  if (!token) {
    return NextResponse.json({ error: "Jeton manquant." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const user = await getUserByResetToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Ce lien de réinitialisation est invalide ou a expiré. Refaites une demande." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await resetPassword(user.id, passwordHash);

  return NextResponse.json({ ok: true });
}
