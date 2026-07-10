import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getUserByEmail, setResetToken } from "@/db/queries";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";

// Réponse volontairement identique dans tous les cas (adresse existante ou
// non, envoi réussi ou non) pour ne jamais révéler si un e-mail est
// enregistré dans la base — bonne pratique de sécurité standard.
const GENERIC_MESSAGE =
  "Si un compte existe avec cette adresse, un e-mail de réinitialisation vient de lui être envoyé.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim();
  const appUrl = process.env.APP_URL || req.nextUrl.origin;

  if (!email) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const user = await getUserByEmail(email);
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    await setResetToken(user.id, token, expiresAt);

    const resetUrl = `${appUrl}/reinitialiser-mot-de-passe?token=${token}`;
    await sendEmail(
      user.email,
      "Réinitialisation de votre mot de passe JobSwap",
      resetPasswordEmailHtml(resetUrl)
    );
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
