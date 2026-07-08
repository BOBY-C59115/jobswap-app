import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-jobswap"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("jobswap_session")?.value;
  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
