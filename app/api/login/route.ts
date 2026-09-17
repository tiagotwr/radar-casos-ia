import { NextResponse } from "next/server";
import { COOKIE_NAME, credentialsOk, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: "Requisição inválida. Tente novamente." },
      { status: 400 }
    );
  }
  const { login, senha } = body as Record<string, unknown>;
  const user = typeof login === "string" ? login.trim() : "";
  const pass = typeof senha === "string" ? senha : "";

  if (!user || !pass) {
    return NextResponse.json(
      { erro: "Informe login e senha." },
      { status: 400 }
    );
  }
  if (!credentialsOk(user, pass)) {
    return NextResponse.json(
      { erro: "Login ou senha incorretos." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, usuario: user });
  res.cookies.set(COOKIE_NAME, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
