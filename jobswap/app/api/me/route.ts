import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserById, getProfileByUserId, ensureConsent } from "@/db/queries";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null }, { status: 200 });

  const user = getUserById(userId);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  const profile = getProfileByUserId(userId);
  const consent = ensureConsent(userId);

  return NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile || null,
    consent,
  });
}
