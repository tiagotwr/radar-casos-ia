import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("sslmode=require") ||
        connectionString.includes("ssl=true")
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return pool;
}

export async function initDb() {
  const db = getPool();
  if (!db) throw new Error("DATABASE_URL não configurada no servidor.");
  await db.query(`
    CREATE TABLE IF NOT EXISTS casos_ia (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      aluno TEXT NOT NULL,
      area TEXT NOT NULL,
      problema TEXT NOT NULL,
      solucao_ia TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export type CasoIA = {
  id: string;
  aluno: string;
  area: string;
  problema: string;
  solucao_ia: string;
  created_at: string;
};

export const AREAS = [
  "Saúde",
  "Educação",
  "Jurídico",
  "Gestão",
  "Engenharia",
  "Finanças",
  "Marketing",
  "Outra",
] as const;
