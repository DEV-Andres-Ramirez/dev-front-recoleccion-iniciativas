import HelpForm from "@/components/help-form";

export default function Home() {
  return (
    <>
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Emergencia · Sismo 7.4 · 10 de agosto de 2026
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl">
            Colombia necesita tu ayuda
          </h1>
          <p className="leading-relaxed text-white/85">
            Si eres una persona, organización, fundación, empresa o institución y puedes
            ofrecer donaciones, servicios o voluntariado para las personas afectadas por
            el terremoto, regístrate aquí. Con esta información construiremos un
            directorio centralizado para coordinar la respuesta en todo el país.
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Solo te pedimos lo esencial: los campos marcados como &ldquo;(opcional)&rdquo;
            puedes dejarlos vacíos. Diligenciarlo toma unos 3 minutos.
          </p>
          <HelpForm />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-2xl px-4 py-6 text-xs leading-relaxed text-muted">
          La información registrada se usará únicamente para coordinar la respuesta a la
          emergencia por el sismo del 10 de agosto de 2026.
        </div>
      </footer>
    </>
  );
}
