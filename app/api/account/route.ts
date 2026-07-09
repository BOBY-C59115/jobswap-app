import { NextResponse } from "next/server";
import { getSessionUserId, destroySession } from "@/lib/auth";
import { softDeleteUser } from "@/db/queries";

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  await softDeleteUser(userId);
  await destroySession();

  return NextResponse.json({ ok: true });
}
