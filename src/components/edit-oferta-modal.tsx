"use client";

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react";
import { actualizarOferta } from "@/app/resultados/actions";
import {
  DEPARTAMENTOS,
  DESCRIPCION_MIN,
  ENTITY_TYPES,
  LIMITS,
  SERVICE_CATEGORIES,
} from "@/lib/constants";
import type { EditState, Oferta } from "@/lib/types";

const inputCls =
  "w-full h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 aria-invalid:border-danger";

function Campo({
  id,
  label,
  error,
  children,
  full,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditOfertaModal({
  oferta,
  onClose,
  onSaved,
}: {
  oferta: Oferta;
  onClose: () => void;
  onSaved: (actualizada: Oferta) => void;
}) {
  const action = useMemo(() => actualizarOferta.bind(null, oferta.id), [oferta.id]);
  const [state, formAction, pending] = useActionState<EditState, FormData>(action, {
    ok: false,
  });
  const [pais, setPais] = useState(oferta.pais);
  // Controlado para no perder lo escrito si la validación de otros campos falla
  // (validateOferta no devuelve notas_internas en values).
  const [notas, setNotas] = useState(oferta.notas_internas ?? "");

  useEffect(() => {
    if (state.ok && state.oferta) onSaved(state.oferta);
  }, [state, onSaved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const values = state.values;
  const errors = state.errors ?? {};
  const esColombia = pais.trim().toLowerCase() === "colombia";
  const def = <K extends keyof Oferta>(campoValues: string | undefined, campoOferta: K) =>
    campoValues ?? ((oferta[campoOferta] ?? "") as string);
  const tiposActuales = values?.tipos_servicio ?? oferta.tipos_servicio;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Editar ${oferta.nombre}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Editar registro</h2>
            <p className="mt-0.5 text-sm text-muted">
              Refina la información tras contactar a la persona o entidad.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar edición"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="edit-tipo_entidad" label="Tipo de persona o entidad" error={errors.tipo_entidad}>
            <select
              key={`te-${values?.tipo_entidad ?? oferta.tipo_entidad}`}
              id="edit-tipo_entidad"
              name="tipo_entidad"
              defaultValue={values?.tipo_entidad ?? oferta.tipo_entidad}
              required
              className={inputCls}
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t.codigo} value={t.codigo}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id="edit-nombre" label="Nombre o razón social" error={errors.nombre}>
            <input
              id="edit-nombre"
              name="nombre"
              defaultValue={def(values?.nombre, "nombre")}
              maxLength={LIMITS.nombre}
              required
              aria-invalid={errors.nombre ? true : undefined}
              className={inputCls}
            />
          </Campo>

          <Campo id="edit-nombre_contacto" label="Persona de contacto" error={errors.nombre_contacto}>
            <input id="edit-nombre_contacto" name="nombre_contacto" defaultValue={def(values?.nombre_contacto, "nombre_contacto")} maxLength={LIMITS.nombre_contacto} className={inputCls} />
          </Campo>
          <Campo id="edit-cargo_contacto" label="Cargo o rol" error={errors.cargo_contacto}>
            <input id="edit-cargo_contacto" name="cargo_contacto" defaultValue={def(values?.cargo_contacto, "cargo_contacto")} maxLength={LIMITS.cargo_contacto} className={inputCls} />
          </Campo>

          <Campo id="edit-telefono" label="Teléfono" error={errors.telefono}>
            <input
              id="edit-telefono"
              name="telefono"
              type="tel"
              defaultValue={def(values?.telefono, "telefono")}
              maxLength={LIMITS.telefono}
              required
              aria-invalid={errors.telefono ? true : undefined}
              className={inputCls}
            />
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="telefono_es_whatsapp"
                defaultChecked={values?.telefono_es_whatsapp ?? oferta.telefono_es_whatsapp}
                className="h-4 w-4 accent-primary"
              />
              Este número tiene WhatsApp
            </label>
          </Campo>
          <Campo id="edit-telefono_alternativo" label="Teléfono alternativo" error={errors.telefono_alternativo}>
            <input id="edit-telefono_alternativo" name="telefono_alternativo" type="tel" defaultValue={def(values?.telefono_alternativo, "telefono_alternativo")} maxLength={LIMITS.telefono_alternativo} className={inputCls} />
          </Campo>

          <Campo id="edit-correo" label="Correo electrónico" error={errors.correo}>
            <input id="edit-correo" name="correo" type="email" defaultValue={def(values?.correo, "correo")} maxLength={LIMITS.correo} aria-invalid={errors.correo ? true : undefined} className={inputCls} />
          </Campo>
          <Campo id="edit-sitio_web" label="Sitio web" error={errors.sitio_web}>
            <input id="edit-sitio_web" name="sitio_web" defaultValue={def(values?.sitio_web, "sitio_web")} maxLength={LIMITS.sitio_web} aria-invalid={errors.sitio_web ? true : undefined} className={inputCls} />
          </Campo>

          <Campo id="edit-pais" label="País" error={errors.pais}>
            <input
              id="edit-pais"
              name="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              maxLength={LIMITS.pais}
              required
              className={inputCls}
            />
          </Campo>
          {esColombia ? (
            <Campo id="edit-departamento" label="Departamento" error={errors.departamento}>
              <select
                key={`dep-${values?.departamento ?? oferta.departamento ?? ""}`}
                id="edit-departamento"
                name="departamento"
                defaultValue={values?.departamento ?? oferta.departamento ?? ""}
                className={inputCls}
              >
                <option value="">— Sin departamento —</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Campo>
          ) : (
            <Campo id="edit-departamento" label="Departamento / región" error={errors.departamento}>
              <input id="edit-departamento" name="departamento" defaultValue={def(values?.departamento, "departamento")} maxLength={LIMITS.departamento} className={inputCls} />
            </Campo>
          )}

          <Campo id="edit-ciudad" label="Ciudad o municipio" error={errors.ciudad}>
            <input id="edit-ciudad" name="ciudad" defaultValue={def(values?.ciudad, "ciudad")} maxLength={LIMITS.ciudad} className={inputCls} />
          </Campo>
          <Campo id="edit-direccion" label="Dirección" error={errors.direccion}>
            <input id="edit-direccion" name="direccion" defaultValue={def(values?.direccion, "direccion")} maxLength={LIMITS.direccion} className={inputCls} />
          </Campo>

          <Campo id="edit-redes_sociales" label="Redes sociales" error={errors.redes_sociales} full>
            <input id="edit-redes_sociales" name="redes_sociales" defaultValue={def(values?.redes_sociales, "redes_sociales")} maxLength={LIMITS.redes_sociales} className={inputCls} />
          </Campo>

          <fieldset className="sm:col-span-2">
            <legend className="mb-1 block text-xs font-semibold text-muted">
              Tipos de ayuda
            </legend>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {SERVICE_CATEGORIES.map((cat) => (
                <label
                  key={cat.codigo}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs leading-snug transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    name="tipos_servicio"
                    value={cat.codigo}
                    defaultChecked={tiposActuales.includes(cat.codigo)}
                    className="mt-0.5 h-3.5 w-3.5 accent-primary"
                  />
                  {cat.nombre}
                </label>
              ))}
            </div>
            {errors.tipos_servicio && (
              <p className="mt-1 text-xs text-danger">{errors.tipos_servicio}</p>
            )}
          </fieldset>

          <Campo id="edit-otro_servicio" label="Otro tipo de ayuda" error={errors.otro_servicio} full>
            <input id="edit-otro_servicio" name="otro_servicio" defaultValue={def(values?.otro_servicio, "otro_servicio")} maxLength={LIMITS.otro_servicio} className={inputCls} />
          </Campo>

          <Campo id="edit-descripcion" label={`Descripción (mínimo ${DESCRIPCION_MIN} caracteres)`} error={errors.descripcion} full>
            <textarea
              id="edit-descripcion"
              name="descripcion"
              rows={4}
              defaultValue={def(values?.descripcion, "descripcion")}
              maxLength={LIMITS.descripcion}
              required
              aria-invalid={errors.descripcion ? true : undefined}
              className={`${inputCls} h-auto py-2.5 leading-relaxed`}
            />
          </Campo>

          <Campo id="edit-cobertura_geografica" label="Cobertura geográfica" error={errors.cobertura_geografica}>
            <input id="edit-cobertura_geografica" name="cobertura_geografica" defaultValue={def(values?.cobertura_geografica, "cobertura_geografica")} maxLength={LIMITS.cobertura_geografica} className={inputCls} />
          </Campo>
          <Campo id="edit-disponibilidad" label="Disponibilidad" error={errors.disponibilidad}>
            <input id="edit-disponibilidad" name="disponibilidad" defaultValue={def(values?.disponibilidad, "disponibilidad")} maxLength={LIMITS.disponibilidad} className={inputCls} />
          </Campo>

          <Campo id="edit-capacidad" label="Capacidad estimada" error={errors.capacidad} full>
            <input id="edit-capacidad" name="capacidad" defaultValue={def(values?.capacidad, "capacidad")} maxLength={LIMITS.capacidad} className={inputCls} />
          </Campo>

          <Campo id="edit-notas_internas" label="Notas internas (solo visibles aquí)" full>
            <textarea
              id="edit-notas_internas"
              name="notas_internas"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={2000}
              placeholder="Ej.: Contactada el 15 de agosto, confirma disponibilidad desde el lunes…"
              className={`${inputCls} h-auto py-2.5 leading-relaxed`}
            />
          </Campo>

          {state.formError && (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger sm:col-span-2"
            >
              {state.formError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-semibold text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
