"use client";

import { useCallback, useEffect, useState } from "react";

const AREAS = [
  "Saúde",
  "Educação",
  "Jurídico",
  "Gestão",
  "Engenharia",
  "Finanças",
  "Marketing",
  "Outra",
];

type Caso = {
  id: string;
  aluno: string;
  area: string;
  problema: string;
  solucao_ia: string;
  created_at: string;
};

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const inputCls =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20";
const labelCls =
  "mb-1.5 block text-sm font-semibold text-stone-700";

export default function Home() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [checandoSessao, setChecandoSessao] = useState(true);

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  const [casos, setCasos] = useState<Caso[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erroLista, setErroLista] = useState("");

  const [aluno, setAluno] = useState("");
  const [area, setArea] = useState("");
  const [problema, setProblema] = useState("");
  const [solucao, setSolucao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroLista("");
    try {
      const res = await fetch("/api/casos", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha ao carregar os casos.");
      setCasos(data.casos || []);
    } catch (e) {
      setErroLista(
        e instanceof Error ? e.message : "Falha ao carregar os casos."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (data.usuario) {
          setUsuario(data.usuario);
        }
      } catch {
        /* mantém tela de login */
      } finally {
        setChecandoSessao(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (usuario) carregar();
  }, [usuario, carregar]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErroLogin("");
    if (!login.trim() || !senha) {
      setErroLogin("Informe login e senha.");
      return;
    }
    setEntrando(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Não foi possível entrar.");
      setUsuario(data.usuario);
      setSenha("");
    } catch (e) {
      setErroLogin(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setEntrando(false);
    }
  }

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    setUsuario(null);
    setCasos([]);
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm("");
    setOkMsg("");
    if (
      !aluno.trim() ||
      !area ||
      !problema.trim() ||
      !solucao.trim()
    ) {
      setErroForm("Preencha todos os campos antes de publicar.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno: aluno.trim(),
          area,
          problema: problema.trim(),
          solucao_ia: solucao.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Não foi possível publicar.");
      setAluno("");
      setArea("");
      setProblema("");
      setSolucao("");
      setOkMsg("Caso publicado com sucesso.");
      await carregar();
    } catch (e) {
      setErroForm(
        e instanceof Error ? e.message : "Não foi possível publicar."
      );
    } finally {
      setEnviando(false);
    }
  }

  const total = casos.length;
  const contador =
    total === 0
      ? "0 casos publicados"
      : total === 1
        ? "1 caso publicado"
        : `${total} casos publicados`;

  return (
    <div className="min-h-screen bg-[#faf8f4] text-stone-900">
      <header className="border-b-2 border-[#1e3a5f] bg-[#fdfcf9]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3 px-4 py-8 sm:px-6">
          <div>
            <p className="mb-2 inline-block rounded-sm bg-[#b45309] px-2 py-0.5 text-xs font-bold tracking-widest text-white uppercase">
              Mural da turma
            </p>
            <h1
              className="text-3xl font-bold text-[#1e3a5f] sm:text-4xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Radar de Casos de Uso de IA
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Mural da turma — o que a inteligência artificial já resolve (ou
              pode resolver) no seu ofício
            </p>
          </div>
          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <span className="text-sm text-stone-600">
                  Acesso: <strong>{usuario}</strong>
                </span>
                <button
                  onClick={sair}
                  className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Sair
                </button>
              </>
            ) : (
              <span className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-500">
                Acesso restrito da turma
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {checandoSessao ? (
          <p className="text-stone-500">Carregando…</p>
        ) : !usuario ? (
          <section className="mx-auto max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2
              className="text-2xl font-bold text-[#1e3a5f]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Entrar
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Use o login e a senha da turma para ver e publicar no mural.
            </p>
            <form onSubmit={entrar} className="mt-5 space-y-4">
              <div>
                <label htmlFor="login" className={labelCls}>
                  Login
                </label>
                <input
                  id="login"
                  type="text"
                  autoComplete="username"
                  className={inputCls}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Seu login de acesso"
                />
              </div>
              <div>
                <label htmlFor="senha" className={labelCls}>
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  className={inputCls}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>
              {erroLogin && (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {erroLogin}
                </p>
              )}
              <button
                type="submit"
                disabled={entrando}
                className="w-full rounded-md bg-[#1e3a5f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#152a45] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {entrando ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <section
              aria-label="Publicar caso"
              className="h-fit rounded-lg border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"
            >
              <h2
                className="text-xl font-bold text-[#1e3a5f]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Publicar um caso
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Conte um problema do seu dia a dia e como a IA ajuda.
              </p>
              <form onSubmit={publicar} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="aluno" className={labelCls}>
                    Nome
                  </label>
                  <input
                    id="aluno"
                    type="text"
                    className={inputCls}
                    value={aluno}
                    onChange={(e) => setAluno(e.target.value)}
                    placeholder="Seu nome"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label htmlFor="area" className={labelCls}>
                    Área
                  </label>
                  <select
                    id="area"
                    className={inputCls}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="problema" className={labelCls}>
                    Problema do dia a dia{" "}
                    <span className="font-normal text-stone-400">
                      ({problema.length}/280)
                    </span>
                  </label>
                  <textarea
                    id="problema"
                    rows={3}
                    maxLength={280}
                    className={`${inputCls} resize-y`}
                    value={problema}
                    onChange={(e) => setProblema(e.target.value)}
                    placeholder="Descreva o problema em até 280 caracteres"
                  />
                </div>
                <div>
                  <label htmlFor="solucao" className={labelCls}>
                    Como a IA ajuda{" "}
                    <span className="font-normal text-stone-400">
                      ({solucao.length}/280)
                    </span>
                  </label>
                  <textarea
                    id="solucao"
                    rows={3}
                    maxLength={280}
                    className={`${inputCls} resize-y`}
                    value={solucao}
                    onChange={(e) => setSolucao(e.target.value)}
                    placeholder="Explique a ajuda da IA em até 280 caracteres"
                  />
                </div>
                {erroForm && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                  >
                    {erroForm}
                  </p>
                )}
                {okMsg && (
                  <p
                    role="status"
                    className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900"
                  >
                    {okMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-md bg-[#1e3a5f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#152a45] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando ? "Enviando…" : "Publicar caso"}
                </button>
              </form>
            </section>

            <section aria-label="Casos publicados">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  className="text-xl font-bold text-[#1e3a5f]"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Casos da turma
                </h2>
                <span className="rounded-full border border-[#1e3a5f]/20 bg-white px-3 py-1 text-sm font-semibold text-[#1e3a5f]">
                  {contador}
                </span>
              </div>

              {carregando ? (
                <p className="text-stone-500">Carregando casos…</p>
              ) : erroLista ? (
                <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
                  <p role="alert" className="text-sm text-red-800">
                    {erroLista}
                  </p>
                  <button
                    onClick={carregar}
                    className="mt-3 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : casos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-sm">
                  <p className="text-lg text-stone-600">
                    Nenhum caso publicado ainda. Seja o primeiro.
                  </p>
                </div>
              ) : (
                <ol className="space-y-4">
                  {casos.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-stone-200 border-l-4 border-l-[#b45309] bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-stone-900">
                          {c.aluno}
                        </span>
                        <span className="rounded-full bg-[#1e3a5f] px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
                          {c.area}
                        </span>
                        <span className="ml-auto text-xs text-stone-500">
                          {formatarData(c.created_at)}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-[15px] leading-relaxed">
                        <p>
                          <strong className="font-semibold text-stone-700">
                            Problema:{" "}
                          </strong>
                          <span className="text-stone-800">{c.problema}</span>
                        </p>
                        <p>
                          <strong className="font-semibold text-stone-700">
                            Como a IA ajuda:{" "}
                          </strong>
                          <span className="text-stone-800">
                            {c.solucao_ia}
                          </span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-[#fdfcf9]">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <p className="text-center text-sm text-stone-500">
            Exercício de aula · Opencode + EasyPanel + Postgres
          </p>
        </div>
      </footer>
    </div>
  );
}
