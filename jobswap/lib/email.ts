/**
 * Envoi d'e-mails via Resend (resend.com), utilisé pour la réinitialisation
 * de mot de passe. Nécessite un compte gratuit sur resend.com et une clé
 * API (RESEND_API_KEY) — voir .env.example.
 *
 * Sans clé configurée, l'envoi échoue silencieusement (retourne false) :
 * l'appelant doit alors informer l'utilisateur que la fonctionnalité n'est
 * pas encore disponible, sans jamais confirmer ou infirmer l'existence
 * d'un compte pour une adresse donnée (sécurité).
 */

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "JobSwap <onboarding@resend.dev>";
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function resetPasswordEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0C1A27;">Réinitialisation de votre mot de passe JobSwap</h2>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous (valable 1 heure) :</p>
      <p><a href="${resetUrl}" style="background:#0DAA85;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;display:inline-block;">Réinitialiser mon mot de passe</a></p>
      <p style="color:#6A849A;font-size:13px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail — aucune modification ne sera effectuée.</p>
    </div>
  `;
}
