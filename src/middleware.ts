import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/authCookie";

// Edge-safe check: we only verify the cookie is present here. The real
// HMAC comparison happens in server code (lib/auth.ts) which needs
// SESSION_SECRET and can't run reliably in the edge runtime with node crypto.
// This middleware just keeps unauthenticated users from ever rendering the
// admin UI; every admin API route re-validates with isAdminAuthed().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie = req.cookies.has(ADMIN_COOKIE);
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
