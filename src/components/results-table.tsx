"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { actualizarEstado } from "@/app/resultados/actions";
import { ENTITY_TYPES, SERVICE_CATEGORIES } from "@/lib/constants";
import type { EstadoOferta, Oferta } from "@/lib/types";

const CATEGORIA_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.codigo, c.nombre]),
);
const ENTIDAD_LABELS: Record<string, string> = Object.fromEntries(
  ENTITY_TYPES.map((t) => [t.codigo, t.nombre]),
);

const ESTADO_META: Record<
  EstadoOferta,
  { label: string; badge: string }
> = {
  pendiente: { label: "Pendiente", badge: "bg-muted/15 text-muted" },
  verificada: { label: "Confiable", badge: "bg-success/15 text-success" },
  descartada: { label: "Falsa", badge: "bg-danger/15 text-danger" },
};

type Filtro = "todas" | EstadoOferta;
type Orden = "recientes" | "antiguas" | "estado";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ubicacion(o: Oferta) {
  const partes = [o.ciudad, o.departamento].filter(Boolean);
  if (o.pais && o.pais.toLowerCase() !== "colombia") partes.push(o.pais);
  return partes.join(", ") || "—";
}

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className ?? "bg-primary/10 text-primary"}`}
    >
      {children}
    </span>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EstadoToggle({
  oferta,
  pending,
  onCambiar,
}: {
  oferta: Oferta;
  pending: boolean;
  onCambiar: (id: string, estado: EstadoOferta) => void;
}) {
  const base =
    "h-8 px-3 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border" role="group" aria-label={`Validación de ${oferta.nombre}`}>
      <button
        type="button"
        disabled={pending}
        aria-pressed={oferta.estado === "verificada"}
        title="Contactada y validada como confiable"
        onClick={() =>
          onCambiar(oferta.id, oferta.estado === "verificada" ? "pendiente" : "verificada")
        }
        className={`${base} ${
          oferta.estado === "verificada"
            ? "bg-success text-white"
            : "bg-card text-muted hover:bg-success/10 hover:text-success"
        }`}
      >
        Confiable
      </button>
      <button
        type="button"
        disabled={pending}
        aria-pressed={oferta.estado === "descartada"}
        title="Contactada y descartada como falsa"
        onClick={() =>
          onCambiar(oferta.id, oferta.estado === "descartada" ? "pendiente" : "descartada")
        }
        className={`${base} border-l border-border ${
          oferta.estado === "descartada"
            ? "bg-danger text-white"
            : "bg-card text-muted hover:bg-danger/10 hover:text-danger"
        }`}
      >
        Falsa
      </button>
    </div>
  );
}

function DetalleItem({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed break-words">{value}</dd>
    </div>
  );
}

function DetalleModal({ oferta, onClose }: { oferta: Oferta; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${oferta.nombre}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{oferta.nombre}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge>{ENTIDAD_LABELS[oferta.tipo_entidad] ?? oferta.tipo_entidad}</Badge>
              <Badge className={ESTADO_META[oferta.estado].badge}>
                {ESTADO_META[oferta.estado].label}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetalleItem label="Registrado" value={formatFecha(oferta.created_at)} />
          <DetalleItem label="Persona de contacto" value={oferta.nombre_contacto} />
          <DetalleItem label="Cargo o rol" value={oferta.cargo_contacto} />
          <DetalleItem
            label="Teléfono"
            value={
              <>
                {oferta.telefono}
                {oferta.telefono_es_whatsapp && (
                  <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    WhatsApp
                  </span>
                )}
              </>
            }
          />
          <DetalleItem label="Teléfono alternativo" value={oferta.telefono_alternativo} />
          <DetalleItem label="Correo" value={oferta.correo} />
          <DetalleItem label="Ubicación" value={ubicacion(oferta)} />
          <DetalleItem label="Dirección" value={oferta.direccion} />
          <DetalleItem
            label="Sitio web"
            value={
              oferta.sitio_web && (
                <a
                  href={oferta.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {oferta.sitio_web}
                </a>
              )
            }
          />
          <DetalleItem label="Redes sociales" value={oferta.redes_sociales} />
          <DetalleItem
            label="Tipos de ayuda"
            value={
              <span className="flex flex-wrap gap-1.5">
                {oferta.tipos_servicio.map((c) => (
                  <Badge key={c}>{CATEGORIA_LABELS[c] ?? c}</Badge>
                ))}
              </span>
            }
          />
          <DetalleItem label="Otro tipo de ayuda" value={oferta.otro_servicio} />
          <DetalleItem label="Cobertura" value={oferta.cobertura_geografica} />
          <DetalleItem label="Disponibilidad" value={oferta.disponibilidad} />
          <DetalleItem label="Capacidad" value={oferta.capacidad} />
          <DetalleItem label="Notas internas" value={oferta.notas_internas} />
        </dl>

        <div className="mt-4 border-t border-border pt-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Descripción
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {oferta.descripcion}
          </dd>
        </div>
      </div>
    </div>
  );
}

export default function ResultsTable({ ofertas }: { ofertas: Oferta[] }) {
  const [rows, setRows] = useState<Oferta[]>(ofertas);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [detalle, setDetalle] = useState<Oferta | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const conteos = useMemo(
    () => ({
      todas: rows.length,
      pendiente: rows.filter((r) => r.estado === "pendiente").length,
      verificada: rows.filter((r) => r.estado === "verificada").length,
      descartada: rows.filter((r) => r.estado === "descartada").length,
    }),
    [rows],
  );

  const visibles = useMemo(() => {
    const filtradas = filtro === "todas" ? rows : rows.filter((r) => r.estado === filtro);
    const pesoEstado: Record<EstadoOferta, number> = {
      pendiente: 0,
      verificada: 1,
      descartada: 2,
    };
    return [...filtradas].sort((a, b) => {
      if (orden === "estado") {
        const d = pesoEstado[a.estado] - pesoEstado[b.estado];
        if (d !== 0) return d;
      }
      const t = Date.parse(b.created_at) - Date.parse(a.created_at);
      return orden === "antiguas" ? -t : t;
    });
  }, [rows, filtro, orden]);

  const confiables = useMemo(
    () => rows.filter((r) => r.estado === "verificada"),
    [rows],
  );

  async function cambiarEstado(id: string, estado: EstadoOferta) {
    setPendingId(id);
    setErrorMsg(null);
    const res = await actualizarEstado(id, estado);
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, estado } : r)));
      setDetalle((d) => (d && d.id === id ? { ...d, estado } : d));
    } else {
      setErrorMsg("No se pudo guardar el cambio de estado. Inténtalo de nuevo.");
    }
    setPendingId(null);
  }

  const chip = (f: Filtro, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setFiltro(f)}
      aria-pressed={filtro === f}
      className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
        filtro === f
          ? "bg-primary text-white"
          : "border border-border bg-card text-muted hover:border-primary/50 hover:text-primary"
      }`}
    >
      {label} · {count}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {chip("todas", "Todas", conteos.todas)}
        {chip("pendiente", "Pendientes", conteos.pendiente)}
        {chip("verificada", "Confiables", conteos.verificada)}
        {chip("descartada", "Falsas", conteos.descartada)}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguas">Más antiguas</option>
            <option value="estado">Estado (pendientes primero)</option>
          </select>
        </label>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {errorMsg}
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted">
          {rows.length === 0
            ? "Aún no hay registros. Comparte el formulario para empezar a recibir ofrecimientos."
            : "No hay registros con este filtro."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Ayuda ofrecida</th>
                <th className="px-4 py-3 font-semibold">Validación</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Ver detalle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background/60">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatFecha(o.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.nombre}</div>
                    <div className="text-xs text-muted">
                      {ENTIDAD_LABELS[o.tipo_entidad] ?? o.tipo_entidad}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="whitespace-nowrap">{o.telefono}</div>
                    {o.correo && <div className="text-xs text-muted">{o.correo}</div>}
                  </td>
                  <td className="px-4 py-3">{ubicacion(o)}</td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-60 flex-wrap gap-1">
                      {o.tipos_servicio.slice(0, 2).map((c) => (
                        <Badge key={c}>{CATEGORIA_LABELS[c] ?? c}</Badge>
                      ))}
                      {o.tipos_servicio.length > 2 && (
                        <Badge className="bg-muted/15 text-muted">
                          +{o.tipos_servicio.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoToggle oferta={o} pending={pendingId === o.id} onCambiar={cambiarEstado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDetalle(o)}
                      aria-label={`Ver detalle de ${o.nombre}`}
                      title="Ver todos los detalles"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold">
          Catálogo preliminar: validadas y confiables
        </h2>
        <p className="mb-4 text-sm text-muted">
          Estas son las ayudas ya contactadas y verificadas que de momento están
          autorizadas para el catálogo.
        </p>
        {confiables.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Todavía no hay ayudas validadas como confiables.
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {confiables.map((o) => (
              <article
                key={o.id}
                className="mb-4 break-inside-avoid rounded-xl border border-success/30 bg-card p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{o.nombre}</h3>
                  <Badge className="shrink-0 bg-success/15 text-success">Confiable</Badge>
                </div>
                <p className="text-xs text-muted">
                  {ENTIDAD_LABELS[o.tipo_entidad] ?? o.tipo_entidad} · {ubicacion(o)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {o.tipos_servicio.map((c) => (
                    <Badge key={c}>{CATEGORIA_LABELS[c] ?? c}</Badge>
                  ))}
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
                  {o.descripcion}
                </p>
                <p className="mt-2 text-sm font-medium">
                  {o.telefono}
                  {o.correo && <span className="text-muted"> · {o.correo}</span>}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {detalle && <DetalleModal oferta={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}
