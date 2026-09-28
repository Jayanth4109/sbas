import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionTokenFor, verifyPin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Persisted in the database (not in-memory) so the lockout survives
// serverless cold starts - a real throttle, not a best-effort one.
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const admin = createAdminClient();

  const { data: record } = await admin
    .from("admin_login_attempts")
    .select("attempts, locked_until")
    .eq("ip", ip)
    .maybeSingle();

  const now = Date.now();
  if (record?.locked_until && new Date(record.locked_until).getTime() > now) {
    const minutes = Math.ceil((new Date(record.locked_until).getTime() - now) / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }

  const { pin } = await req.json().catch(() => ({ pin: "" }));

  if (typeof pin !== "string" || !verifyPin(pin)) {
    const attempts = (record?.attempts ?? 0) + 1;
    const lockedOut = attempts >= MAX_ATTEMPTS;
    await admin.from("admin_login_attempts").upsert({
      ip,
      attempts: lockedOut ? 0 : attempts,
      locked_until: lockedOut ? new Date(now + LOCKOUT_MS).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        error: lockedOut
          ? `Too many attempts. Try again in ${Math.round(LOCKOUT_MS / 60000)} minutes.`
          : "Incorrect PIN",
      },
      { status: lockedOut ? 429 : 401 },
    );
  }

  if (record) {
    await admin.from("admin_login_attempts").delete().eq("ip", ip);
  }

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
