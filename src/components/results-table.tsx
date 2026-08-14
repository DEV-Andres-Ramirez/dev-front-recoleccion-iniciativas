"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { actualizarEstado } from "@/app/resultados/actions";
import EditOfertaModal from "@/components/edit-oferta-modal";
import { ENTITY_TYPES, SERVICE_CATEGORIES } from "@/lib/constants";
import type { EstadoOferta, Oferta } from "@/lib/types";

const CATEGORIA_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.codigo, c.nombre]),
);
const ENTIDAD_LABELS: Record<string, string> = Object.fromEntries(
  ENTITY_TYPES.map((t) => [t.codigo, t.nombre]),
);

const ESTADO_META: Record<EstadoOferta, { label: string; badge: string }> = {
  pendiente: { label: "Pendiente", badge: "bg-muted/15 text-muted" },
  verificada: { label: "Confiable", badge: "bg-success/15 text-success" },
  descartada: { label: "Falsa", badge: "bg-danger/15 text-danger" },
};

// Campos por los que se puede filtrar "que estén diligenciados".
const CAMPOS_DILIGENCIADOS: { key: keyof Oferta; label: string }[] = [
  { key: "correo", label: "Correo" },
  { key: "sitio_web", label: "Sitio web" },
  { key: "nombre_contacto", label: "Persona de contacto" },
  { key: "telefono_alternativo", label: "Tel. alternativo" },
  { key: "redes_sociales", label: "Redes sociales" },
  { key: "direccion", label: "Dirección" },
  { key: "ciudad", label: "Ciudad" },
  { key: "departamento", label: "Departamento" },
  { key: "cobertura_geografica", label: "Cobertura" },
  { key: "disponibilidad", label: "Disponibilidad" },
  { key: "capacidad", label: "Capacidad" },
  { key: "otro_servicio", label: "Otro servicio" },
  { key: "notas_internas", label: "Notas internas" },
];

const TAMANOS_PAGINA = [5, 10, 25, 50];

type Filtro = "todas" | EstadoOferta;
type Orden = "recientes" | "antiguas" | "estado";

function campoLleno(o: Oferta, key: keyof Oferta) {
  const v = o[key];
  return v !== null && v !== undefined && String(v).trim() !== "";
}

// Formato manual: toLocaleString produce textos distintos según la versión de
// ICU de Node vs. el navegador ("ago" vs "ago.") y rompe la hidratación.
// Colombia es siempre UTC-5 (sin horario de verano).
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatFecha(iso: string) {
  const bogota = new Date(Date.parse(iso) - 5 * 60 * 60 * 1000);
  const dia = bogota.getUTCDate();
  const mes = MESES[bogota.getUTCMonth()];
  const h24 = bogota.getUTCHours();
  const min = String(bogota.getUTCMinutes()).padStart(2, "0");
  const ampm = h24 >= 12 ? "p. m." : "a. m.";
  const h12 = String(h24 % 12 || 12).padStart(2, "0");
  return `${dia} de ${mes}, ${h12}:${min} ${ampm}`;
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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
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
    <div
      className="inline-flex overflow-hidden rounded-lg border border-border"
      role="group"
      aria-label={`Validación de ${oferta.nombre}`}
    >
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
  const vacio = value === null || value === undefined || value === "";
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm leading-relaxed break-words ${vacio ? "text-muted" : ""}`}>
        {vacio ? "—" : value}
      </dd>
    </div>
  );
}

function DetalleModal({
  oferta,
  onClose,
  onEditar,
}: {
  oferta: Oferta;
  onClose: () => void;
  onEditar: () => void;
}) {
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
          <DetalleItem label="Última actualización" value={formatFecha(oferta.updated_at)} />
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
          <DetalleItem label="País" value={oferta.pais} />
          <DetalleItem label="Departamento" value={oferta.departamento} />
          <DetalleItem label="Ciudad o municipio" value={oferta.ciudad} />
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
          <DetalleItem label="Cobertura geográfica" value={oferta.cobertura_geografica} />
          <DetalleItem label="Disponibilidad" value={oferta.disponibilidad} />
          <DetalleItem label="Capacidad estimada" value={oferta.capacidad} />
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

        <div className="mt-5 flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-border px-5 text-sm font-semibold text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onEditar}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PencilIcon />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsTable({ ofertas }: { ofertas: Oferta[] }) {
  const [rows, setRows] = useState<Oferta[]>(ofertas);
  const [detalle, setDetalle] = useState<Oferta | null>(null);
  const [editando, setEditando] = useState<Oferta | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEntidad, setFiltroEntidad] = useState("todas");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [camposLlenos, setCamposLlenos] = useState<(keyof Oferta)[]>([]);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [tamPagina, setTamPagina] = useState(10);

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
    const q = busqueda.trim().toLowerCase();
    const filtradas = rows.filter((r) => {
      if (filtro !== "todas" && r.estado !== filtro) return false;
      if (filtroEntidad !== "todas" && r.tipo_entidad !== filtroEntidad) return false;
      if (filtroCategoria !== "todas" && !r.tipos_servicio.includes(filtroCategoria))
        return false;
      if (camposLlenos.some((campo) => !campoLleno(r, campo))) return false;
      if (q !== "") {
        const texto = [
          r.nombre,
          r.nombre_contacto,
          r.correo,
          r.telefono,
          r.telefono_alternativo,
          r.ciudad,
          r.departamento,
          r.descripcion,
          r.redes_sociales,
          r.sitio_web,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
    const pesoEstado: Record<EstadoOferta, number> = {
      pendiente: 0,
      verificada: 1,
      descartada: 2,
    };
    return filtradas.sort((a, b) => {
      if (orden === "estado") {
        const d = pesoEstado[a.estado] - pesoEstado[b.estado];
        if (d !== 0) return d;
      }
      const t = Date.parse(b.created_at) - Date.parse(a.created_at);
      return orden === "antiguas" ? -t : t;
    });
  }, [rows, filtro, orden, busqueda, filtroEntidad, filtroCategoria, camposLlenos]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, orden, busqueda, filtroEntidad, filtroCategoria, camposLlenos, tamPagina]);

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / tamPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * tamPagina;
  const pageRows = visibles.slice(desde, desde + tamPagina);

  const numerosPagina = useMemo<(number | "...")[]>(() => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    const nums = new Set<number>([1, totalPaginas]);
    for (let p = paginaActual - 1; p <= paginaActual + 1; p++) {
      if (p >= 1 && p <= totalPaginas) nums.add(p);
    }
    const orden = [...nums].sort((a, b) => a - b);
    const res: (number | "...")[] = [];
    orden.forEach((n, i) => {
      if (i > 0 && n - orden[i - 1] > 1) res.push("...");
      res.push(n);
    });
    return res;
  }, [paginaActual, totalPaginas]);

  const confiables = useMemo(() => rows.filter((r) => r.estado === "verificada"), [rows]);

  const hayFiltrosActivos =
    filtro !== "todas" ||
    busqueda.trim() !== "" ||
    filtroEntidad !== "todas" ||
    filtroCategoria !== "todas" ||
    camposLlenos.length > 0;

  function limpiarFiltros() {
    setFiltro("todas");
    setBusqueda("");
    setFiltroEntidad("todas");
    setFiltroCategoria("todas");
    setCamposLlenos([]);
  }

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

  const guardarEdicion = useCallback((actualizada: Oferta) => {
    setRows((rs) => rs.map((r) => (r.id === actualizada.id ? actualizada : r)));
    setEditando(null);
    setDetalle((d) => (d && d.id === actualizada.id ? actualizada : d));
  }, []);

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

  const selectCls =
    "h-10 rounded-lg border border-border bg-card px-2 text-sm text-foreground focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      {/* Barra de filtros */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-55 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, contacto, teléfono, ciudad…"
              aria-label="Buscar registros"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={filtroEntidad}
            onChange={(e) => setFiltroEntidad(e.target.value)}
            aria-label="Filtrar por tipo de entidad"
            className={selectCls}
          >
            <option value="todas">Toda entidad</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t.codigo} value={t.codigo}>
                {t.nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            aria-label="Filtrar por tipo de ayuda"
            className={selectCls}
          >
            <option value="todas">Toda ayuda</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.nombre}
              </option>
            ))}
          </select>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="h-10 rounded-lg px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Con información en:
          </span>
          {CAMPOS_DILIGENCIADOS.map(({ key, label }) => {
            const activo = camposLlenos.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={activo}
                onClick={() =>
                  setCamposLlenos((cs) =>
                    activo ? cs.filter((c) => c !== key) : [...cs, key],
                  )
                }
                className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
                  activo
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-muted hover:border-primary/50 hover:text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

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
            className={selectCls}
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
            : "No hay registros que cumplan los filtros seleccionados."}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Ubicación</th>
                  <th className="px-4 py-3 font-semibold">Ayuda ofrecida</th>
                  <th className="px-4 py-3 font-semibold">Validación</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-b-0 hover:bg-background/60"
                  >
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
                      <EstadoToggle
                        oferta={o}
                        pending={pendingId === o.id}
                        onCambiar={cambiarEstado}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetalle(o)}
                        aria-label={`Ver detalle de ${o.nombre}`}
                        title="Ver todos los detalles"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditando(o)}
                        aria-label={`Editar ${o.nombre}`}
                        title="Editar registro"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <PencilIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted">
              Mostrando {desde + 1}–{Math.min(desde + tamPagina, visibles.length)} de{" "}
              {visibles.length} registros
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                Por página
                <select
                  value={tamPagina}
                  onChange={(e) => setTamPagina(Number(e.target.value))}
                  className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground"
                >
                  {TAMANOS_PAGINA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <nav className="flex items-center gap-1" aria-label="Paginación">
                <button
                  type="button"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina(paginaActual - 1)}
                  aria-label="Página anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                {numerosPagina.map((n, i) =>
                  n === "..." ? (
                    <span key={`gap-${i}`} className="px-1 text-sm text-muted">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPagina(n)}
                      aria-current={n === paginaActual ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors ${
                        n === paginaActual
                          ? "bg-primary text-white"
                          : "border border-border text-muted hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                  aria-label="Página siguiente"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
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

      {detalle && (
        <DetalleModal
          oferta={detalle}
          onClose={() => setDetalle(null)}
          onEditar={() => {
            setEditando(detalle);
            setDetalle(null);
          }}
        />
      )}
      {editando && (
        <EditOfertaModal
          oferta={editando}
          onClose={() => setEditando(null)}
          onSaved={guardarEdicion}
        />
      )}
    </div>
  );
}
