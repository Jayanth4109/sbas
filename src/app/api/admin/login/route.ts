import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionTokenFor, verifyPin } from "@/lib/auth";

// Best-effort brute-force throttle. Resets whenever the function instance
// recycles, which is an accepted tradeoff for a low-value single-PIN login.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  const { pin } = await req.json().catch(() => ({ pin: "" }));

  if (typeof pin !== "string" || !verifyPin(pin)) {
    const next = entry && entry.resetAt > now ? { count: entry.count + 1, resetAt: entry.resetAt } : { count: 1, resetAt: now + WINDOW_MS };
    attempts.set(ip, next);
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionTokenFor(pin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
