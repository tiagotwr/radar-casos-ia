import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "radar_session";

function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMINPASSWORD ||
    "radar-dev-secret"
  );
}

export function signSession(user: string): string {
  const sig = createHmac("sha256", secret()).update(user).digest("hex");
  return `${Buffer.from(user, "utf8").toString("base64url")}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  let user: string;
  try {
    user = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret()).update(user).digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return user;
}

export function credentialsOk(user: string, pass: string): boolean {
  const expectedUser = process.env.ADMINUSER || "";
  const expectedPass = process.env.ADMINPASSWORD || "";
  if (!expectedUser || !expectedPass) return false;
  const a = Buffer.from(user, "utf8");
  const b = Buffer.from(expectedUser, "utf8");
  const c = Buffer.from(pass, "utf8");
  const d = Buffer.from(expectedPass, "utf8");
  if (a.length !== b.length || c.length !== d.length) return false;
  return timingSafeEqual(a, b) && timingSafeEqual(c, d);
}

export async function currentUser(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME };
