"use client";

import { useActionState, useState, type ReactNode } from "react";
import { submitOferta } from "@/app/actions";
import {
  DEPARTAMENTOS,
  DESCRIPCION_MIN,
  ENTITY_TYPES,
  LIMITS,
  SERVICE_CATEGORIES,
} from "@/lib/constants";
import { initialFormState } from "@/lib/validation";

const inputCls =
  "w-full h-12 rounded-lg border border-border bg-card px-3 text-base text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 aria-invalid:border-danger aria-invalid:ring-danger/20";

function FieldShell({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({
  name,
  label,
  optional,
  error,
  defaultValue,
  type = "text",
  inputMode,
  placeholder,
  maxLength,
  hint,
  autoComplete,
  required,
}: {
  name: string;
  label: string;
  optional?: boolean;
  error?: string;
  defaultValue?: string;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  placeholder?: string;
  maxLength?: number;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = `campo-${name}`;
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputCls}
      />
    </FieldShell>
  );
}

function TextAreaField({
  name,
  label,
  optional,
  error,
  defaultValue,
  placeholder,
  maxLength,
  hint,
  rows = 5,
  required,
}: {
  name: string;
  label: string;
  optional?: boolean;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
  rows?: number;
  required?: boolean;
}) {
  const id = `campo-${name}`;
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputCls} h-auto py-3 leading-relaxed`}
      />
    </FieldShell>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {step}
        </span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <svg
          className="h-8 w-8 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold">¡Gracias por tu solidaridad!</h2>
      <p className="mb-6 leading-relaxed text-muted">
        Hemos registrado tu ofrecimiento de ayuda. El equipo coordinador revisará la
        información y se pondrá en contacto contigo para articular la respuesta.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="h-12 rounded-xl bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Registrar otra ayuda
      </button>
    </div>
  );
}

export default function HelpForm() {
  const [formKey, setFormKey] = useState(0);
  return <InnerForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function InnerForm({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitOferta, initialFormState);
  // País controlado: si no es Colombia, el departamento pasa a texto libre.
  const [pais, setPais] = useState("Colombia");

  if (state.ok) {
    return <SuccessScreen onReset={onReset} />;
  }

  const values = state.values;
  const errors = state.errors ?? {};
  const esColombia = pais.trim().toLowerCase() === "colombia";
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} className="relative space-y-6">
      {/* Honeypot: invisible para personas, los bots suelen llenarlo */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="sitio_web_confirmacion">No llenes este campo</label>
        <input
          id="sitio_web_confirmacion"
          type="text"
          name="sitio_web_confirmacion"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <Section step={1} title="¿Quién ofrece la ayuda?">
        <FieldShell
          id="campo-tipo_entidad"
          label="Tipo de persona o entidad"
          error={errors.tipo_entidad}
        >
          {/* key: React 19 resetea los <select> tras un envío con errores; el
              remount con el valor devuelto por el servidor preserva la elección */}
          <select
            key={`tipo-${values?.tipo_entidad ?? ""}`}
            id="campo-tipo_entidad"
            name="tipo_entidad"
            defaultValue={values?.tipo_entidad ?? ""}
            required
            aria-invalid={errors.tipo_entidad ? true : undefined}
            aria-describedby={errors.tipo_entidad ? "campo-tipo_entidad-error" : undefined}
            className={inputCls}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {ENTITY_TYPES.map((t) => (
              <option key={t.codigo} value={t.codigo}>
                {t.nombre}
              </option>
            ))}
          </select>
        </FieldShell>
        <TextField
          name="nombre"
          label="Nombre o razón social"
          placeholder="Ej.: Fundación Manos Unidas / María Pérez"
          defaultValue={values?.nombre}
          error={errors.nombre}
          maxLength={LIMITS.nombre}
          autoComplete="organization"
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="nombre_contacto"
            label="Persona de contacto"
            optional
            placeholder="¿Con quién hablamos?"
            defaultValue={values?.nombre_contacto}
            error={errors.nombre_contacto}
            maxLength={LIMITS.nombre_contacto}
            autoComplete="name"
          />
          <TextField
            name="cargo_contacto"
            label="Cargo o rol"
            optional
            placeholder="Ej.: Directora, voluntario"
            defaultValue={values?.cargo_contacto}
            error={errors.cargo_contacto}
            maxLength={LIMITS.cargo_contacto}
          />
        </div>
      </Section>

      <Section step={2} title="Datos de contacto">
        <div>
          <TextField
            name="telefono"
            label="Teléfono"
            type="tel"
            inputMode="tel"
            placeholder="Ej.: +57 300 123 4567"
            defaultValue={values?.telefono}
            error={errors.telefono}
            maxLength={LIMITS.telefono}
            autoComplete="tel"
            required
          />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="telefono_es_whatsapp"
              defaultChecked={values?.telefono_es_whatsapp}
              className="h-4 w-4 accent-primary"
            />
            Este número tiene WhatsApp
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="telefono_alternativo"
            label="Teléfono alternativo"
            optional
            type="tel"
            inputMode="tel"
            defaultValue={values?.telefono_alternativo}
            error={errors.telefono_alternativo}
            maxLength={LIMITS.telefono_alternativo}
          />
          <TextField
            name="correo"
            label="Correo electrónico"
            optional
            type="email"
            inputMode="email"
            placeholder="nombre@dominio.com"
            defaultValue={values?.correo}
            error={errors.correo}
            maxLength={LIMITS.correo}
            autoComplete="email"
          />
        </div>
        <TextField
          name="sitio_web"
          label="Sitio web"
          optional
          placeholder="www.miorganizacion.org"
          defaultValue={values?.sitio_web}
          error={errors.sitio_web}
          maxLength={LIMITS.sitio_web}
          hint="Si tienen página web, nos ayuda a conocer mejor su trabajo."
          autoComplete="url"
        />
        <TextField
          name="redes_sociales"
          label="Redes sociales"
          optional
          placeholder="Instagram, Facebook, X…"
          defaultValue={values?.redes_sociales}
          error={errors.redes_sociales}
          maxLength={LIMITS.redes_sociales}
        />
      </Section>

      <Section step={3} title="Ubicación">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldShell id="campo-pais" label="País" error={errors.pais}>
            <input
              id="campo-pais"
              name="pais"
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              maxLength={LIMITS.pais}
              autoComplete="country-name"
              required
              aria-invalid={errors.pais ? true : undefined}
              aria-describedby={errors.pais ? "campo-pais-error" : undefined}
              className={inputCls}
            />
          </FieldShell>
          {esColombia ? (
            <FieldShell
              id="campo-departamento"
              label="Departamento"
              optional
              error={errors.departamento}
            >
              <select
                key={`dep-${values?.departamento ?? ""}`}
                id="campo-departamento"
                name="departamento"
                defaultValue={values?.departamento ?? ""}
                aria-invalid={errors.departamento ? true : undefined}
                aria-describedby={
                  errors.departamento ? "campo-departamento-error" : undefined
                }
                className={inputCls}
              >
                <option value="">— Selecciona —</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FieldShell>
          ) : (
            <TextField
              name="departamento"
              label="Departamento / región"
              optional
              defaultValue={values?.departamento}
              error={errors.departamento}
              maxLength={LIMITS.departamento}
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="ciudad"
            label="Ciudad o municipio"
            optional
            defaultValue={values?.ciudad}
            error={errors.ciudad}
            maxLength={LIMITS.ciudad}
            autoComplete="address-level2"
          />
          <TextField
            name="direccion"
            label="Dirección"
            optional
            defaultValue={values?.direccion}
            error={errors.direccion}
            maxLength={LIMITS.direccion}
            autoComplete="street-address"
          />
        </div>
      </Section>

      <Section step={4} title="Ayuda que ofrece">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium">
            ¿Qué tipo de ayuda puede ofrecer? Marque todas las que apliquen.
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <label
                key={cat.codigo}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  name="tipos_servicio"
                  value={cat.codigo}
                  defaultChecked={values?.tipos_servicio?.includes(cat.codigo)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-sm leading-snug">{cat.nombre}</span>
              </label>
            ))}
          </div>
          {errors.tipos_servicio && (
            <p className="mt-1.5 text-sm text-danger" role="alert">
              {errors.tipos_servicio}
            </p>
          )}
        </fieldset>
        <TextField
          name="otro_servicio"
          label="¿Cuál otro tipo de ayuda?"
          optional
          placeholder="Si marcaste 'Otro', cuéntanos cuál"
          defaultValue={values?.otro_servicio}
          error={errors.otro_servicio}
          maxLength={LIMITS.otro_servicio}
        />
        <TextAreaField
          name="descripcion"
          label="Descripción detallada de la ayuda"
          placeholder="Describe qué ofreces, cantidades, condiciones, horarios, cómo funciona…"
          defaultValue={values?.descripcion}
          error={errors.descripcion}
          maxLength={LIMITS.descripcion}
          hint={`Mínimo ${DESCRIPCION_MIN} caracteres. Entre más detalle, más fácil coordinar la ayuda.`}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="cobertura_geografica"
            label="¿En qué zonas puede ayudar?"
            optional
            placeholder="Ej.: Todo el país, Eje Cafetero…"
            defaultValue={values?.cobertura_geografica}
            error={errors.cobertura_geografica}
            maxLength={LIMITS.cobertura_geografica}
          />
          <TextField
            name="disponibilidad"
            label="Disponibilidad"
            optional
            placeholder="Ej.: Inmediata, fines de semana…"
            defaultValue={values?.disponibilidad}
            error={errors.disponibilidad}
            maxLength={LIMITS.disponibilidad}
          />
        </div>
        <TextField
          name="capacidad"
          label="Capacidad estimada"
          optional
          placeholder="Ej.: 200 mercados semanales, 3 vehículos, 10 voluntarios…"
          defaultValue={values?.capacidad}
          error={errors.capacidad}
          maxLength={LIMITS.capacidad}
        />
      </Section>

      {state.formError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {state.formError}
        </div>
      )}
      {hasFieldErrors && !state.formError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          Revisa los campos marcados en rojo antes de enviar.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            Enviando…
          </>
        ) : (
          "Registrar mi ayuda"
        )}
      </button>
    </form>
  );
}
