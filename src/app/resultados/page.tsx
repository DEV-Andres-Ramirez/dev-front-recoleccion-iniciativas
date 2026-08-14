import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ResultsTable from "@/components/results-table";
import type { Oferta } from "@/lib/types";

export const metadata: Metadata = {
  title: "Resultados y validación | Registro de Ayuda Humanitaria",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const { data, error } = await supabase.rpc("resultados_listar", {
    p_token: process.env.RESULTADOS_TOKEN!,
  });

  return (
    <>
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <span className="mb-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Uso interno
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">Resultados y validación</h1>
          <p className="mt-1 text-sm text-white/85">
            Ofrecimientos de ayuda registrados. Valida cada uno tras contactarlo:
            márcalo como Confiable o Falsa.
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
            >
              No se pudieron cargar los registros. Recarga la página o revisa la
              configuración del servidor.
            </div>
          ) : (
            <ResultsTable ofertas={(data ?? []) as Oferta[]} />
          )}
        </div>
      </main>
    </>
  );
}
