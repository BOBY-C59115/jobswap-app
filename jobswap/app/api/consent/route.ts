import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { updateConsent, ensureConsent } from "@/db/queries";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  return NextResponse.json({ consent: ensureConsent(userId) });
}

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const consent = updateConsent(userId, {
    phase2: body.phase2 !== undefined ? (body.phase2 ? 1 : 0) : undefined,
    phase3: body.phase3 !== undefined ? (body.phase3 ? 1 : 0) : undefined,
    phase4: body.phase4 !== undefined ? (body.phase4 ? 1 : 0) : undefined,
  });

  return NextResponse.json({ ok: true, consent });
}
