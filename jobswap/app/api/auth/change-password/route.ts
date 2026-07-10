import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserById, resetPassword } from "@/db/queries";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword || "";
  const newPassword = body?.newPassword || "";

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await resetPassword(userId, passwordHash);

  return NextResponse.json({ ok: true });
}
