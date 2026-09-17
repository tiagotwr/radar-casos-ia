import { NextResponse } from "next/server";
import { AREAS, getPool, initDb, type CasoIA } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { erro: "Sessão expirada. Entre novamente." },
      { status: 401 }
    );
  }
  try {
    await initDb();
    const db = getPool()!;
    const { rows } = await db.query<CasoIA>(
      "SELECT id, aluno, area, problema, solucao_ia, created_at FROM casos_ia ORDER BY created_at DESC"
    );
    return NextResponse.json({ casos: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao carregar os casos.";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { erro: "Sessão expirada. Entre novamente." },
      { status: 401 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: "Requisição inválida. Tente novamente." },
      { status: 400 }
    );
  }
  const { aluno, area, problema, solucao_ia } = body as Record<string, unknown>;

  const nome = typeof aluno === "string" ? aluno.trim() : "";
  const areaLimpa = typeof area === "string" ? area.trim() : "";
  const problemaLimpo = typeof problema === "string" ? problema.trim() : "";
  const solucaoLimpa = typeof solucao_ia === "string" ? solucao_ia.trim() : "";

  if (!nome || !areaLimpa || !problemaLimpo || !solucaoLimpa) {
    return NextResponse.json(
      { erro: "Preencha todos os campos antes de publicar." },
      { status: 400 }
    );
  }
  if (!(AREAS as readonly string[]).includes(areaLimpa)) {
    return NextResponse.json(
      { erro: "Área inválida. Escolha uma das opções da lista." },
      { status: 400 }
    );
  }
  if (problemaLimpo.length > 280 || solucaoLimpa.length > 280) {
    return NextResponse.json(
      { erro: "Problema e solução devem ter no máximo 280 caracteres." },
      { status: 400 }
    );
  }

  try {
    await initDb();
    const db = getPool()!;
    const { rows } = await db.query<CasoIA>(
      "INSERT INTO casos_ia (aluno, area, problema, solucao_ia) VALUES ($1, $2, $3, $4) RETURNING id, aluno, area, problema, solucao_ia, created_at",
      [nome, areaLimpa, problemaLimpo, solucaoLimpa]
    );
    return NextResponse.json({ caso: rows[0] }, { status: 201 });
  } catch (e) {
    const msg =
      e instanceof Error
        ? `Não foi possível salvar: ${e.message}`
        : "Não foi possível salvar o caso. Tente novamente.";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
