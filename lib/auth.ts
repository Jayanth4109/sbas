import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export { ADMIN_COOKIE } from "./authCookie";
import { ADMIN_COOKIE } from "./authCookie";

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("hex");
}

export function verifyPin(pin: string): boolean {
  const expected = (process.env.ADMIN_PIN ?? "").trim();
  if (!expected || pin.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(pin), Buffer.from(expected));
}

export function sessionTokenFor(pin: string): string {
  return sign(pin);
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_PIN ? sessionTokenFor(process.env.ADMIN_PIN) : undefined;
  if (!token || !expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
