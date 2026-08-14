import {
  DEPARTAMENTOS,
  DESCRIPCION_MIN,
  ENTITY_TYPE_CODES,
  LIMITS,
  SERVICE_CATEGORY_CODES,
} from "@/lib/constants";

// Valores tal como los diligenció la persona, para repoblar el formulario
// (defaultValue/defaultChecked) cuando hay errores.
export type FormValues = {
  tipo_entidad: string;
  nombre: string;
  nombre_contacto: string;
  cargo_contacto: string;
  telefono: string;
  telefono_es_whatsapp: boolean;
  telefono_alternativo: string;
  correo: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  sitio_web: string;
  redes_sociales: string;
  tipos_servicio: string[];
  otro_servicio: string;
  descripcion: string;
  cobertura_geografica: string;
  disponibilidad: string;
  capacidad: string;
};

export type FormState = {
  ok: boolean;
  errors?: Record<string, string>;
  formError?: string;
  values?: FormValues;
};

export const initialFormState: FormState = { ok: false };

// Fila lista para insertar en public.ofertas_ayuda.
export type OfertaRow = {
  tipo_entidad: string;
  nombre: string;
  nombre_contacto: string | null;
  cargo_contacto: string | null;
  telefono: string;
  telefono_es_whatsapp: boolean;
  telefono_alternativo: string | null;
  correo: string | null;
  pais: string;
  departamento: string | null;
  ciudad: string | null;
  direccion: string | null;
  sitio_web: string | null;
  redes_sociales: string | null;
  tipos_servicio: string[];
  otro_servicio: string | null;
  descripcion: string;
  cobertura_geografica: string | null;
  disponibilidad: string | null;
  capacidad: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{7,15}$/;

function str(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function normalizePhone(value: string): string {
  return value.replace(/[\s().\-]/g, "");
}

export function validateOferta(formData: FormData): {
  row?: OfertaRow;
  errors: Record<string, string>;
  values: FormValues;
} {
  const errors: Record<string, string> = {};

  const values: FormValues = {
    tipo_entidad: str(formData, "tipo_entidad"),
    nombre: str(formData, "nombre"),
    nombre_contacto: str(formData, "nombre_contacto"),
    cargo_contacto: str(formData, "cargo_contacto"),
    telefono: str(formData, "telefono"),
    telefono_es_whatsapp: checkbox(formData, "telefono_es_whatsapp"),
    telefono_alternativo: str(formData, "telefono_alternativo"),
    correo: str(formData, "correo"),
    pais: str(formData, "pais") || "Colombia",
    departamento: str(formData, "departamento"),
    ciudad: str(formData, "ciudad"),
    direccion: str(formData, "direccion"),
    sitio_web: str(formData, "sitio_web"),
    redes_sociales: str(formData, "redes_sociales"),
    tipos_servicio: formData
      .getAll("tipos_servicio")
      .filter((v): v is string => typeof v === "string"),
    otro_servicio: str(formData, "otro_servicio"),
    descripcion: str(formData, "descripcion"),
    cobertura_geografica: str(formData, "cobertura_geografica"),
    disponibilidad: str(formData, "disponibilidad"),
    capacidad: str(formData, "capacidad"),
  };

  // --- Quién ofrece la ayuda ---
  if (!(ENTITY_TYPE_CODES as readonly string[]).includes(values.tipo_entidad)) {
    errors.tipo_entidad = "Selecciona quién ofrece la ayuda.";
  }
  if (values.nombre.length < 2) {
    errors.nombre = "Escribe el nombre de la persona o entidad.";
  } else if (values.nombre.length > LIMITS.nombre) {
    errors.nombre = `Máximo ${LIMITS.nombre} caracteres.`;
  }
  if (values.nombre_contacto.length > LIMITS.nombre_contacto) {
    errors.nombre_contacto = `Máximo ${LIMITS.nombre_contacto} caracteres.`;
  }
  if (values.cargo_contacto.length > LIMITS.cargo_contacto) {
    errors.cargo_contacto = `Máximo ${LIMITS.cargo_contacto} caracteres.`;
  }

  // --- Contacto ---
  const telefono = normalizePhone(values.telefono);
  if (telefono === "") {
    errors.telefono = "Necesitamos un teléfono para contactarte.";
  } else if (!PHONE_RE.test(telefono)) {
    errors.telefono = "Escribe un teléfono válido (solo números, puede iniciar con +).";
  }
  const telefonoAlternativo = normalizePhone(values.telefono_alternativo);
  if (telefonoAlternativo !== "" && !PHONE_RE.test(telefonoAlternativo)) {
    errors.telefono_alternativo = "Escribe un teléfono válido (solo números, puede iniciar con +).";
  }
  const correo = values.correo.toLowerCase();
  if (correo !== "" && (!EMAIL_RE.test(correo) || correo.length > LIMITS.correo)) {
    errors.correo = "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  }

  // --- Ubicación ---
  if (values.pais.length > LIMITS.pais) {
    errors.pais = `Máximo ${LIMITS.pais} caracteres.`;
  }
  const esColombia = values.pais.toLowerCase() === "colombia";
  if (esColombia) {
    if (
      values.departamento !== "" &&
      !(DEPARTAMENTOS as readonly string[]).includes(values.departamento)
    ) {
      errors.departamento = "Selecciona un departamento de la lista.";
    }
  } else if (values.departamento.length > LIMITS.departamento) {
    errors.departamento = `Máximo ${LIMITS.departamento} caracteres.`;
  }
  if (values.ciudad.length > LIMITS.ciudad) {
    errors.ciudad = `Máximo ${LIMITS.ciudad} caracteres.`;
  }
  if (values.direccion.length > LIMITS.direccion) {
    errors.direccion = `Máximo ${LIMITS.direccion} caracteres.`;
  }

  // --- Presencia en línea ---
  let sitioWeb = values.sitio_web;
  if (sitioWeb !== "") {
    if (!/^https?:\/\//i.test(sitioWeb)) {
      sitioWeb = `https://${sitioWeb}`;
    }
    let valida = false;
    try {
      valida = new URL(sitioWeb).hostname.includes(".");
    } catch {
      valida = false;
    }
    if (!valida || sitioWeb.length > LIMITS.sitio_web) {
      errors.sitio_web = "Escribe una dirección válida, por ejemplo www.miorganizacion.org.";
    }
  }
  if (values.redes_sociales.length > LIMITS.redes_sociales) {
    errors.redes_sociales = `Máximo ${LIMITS.redes_sociales} caracteres.`;
  }

  // --- Ayuda ofrecida ---
  const tiposServicio = values.tipos_servicio.filter((codigo) =>
    (SERVICE_CATEGORY_CODES as readonly string[]).includes(codigo),
  );
  if (tiposServicio.length === 0) {
    errors.tipos_servicio = "Selecciona al menos un tipo de ayuda.";
  }
  if (values.otro_servicio.length > LIMITS.otro_servicio) {
    errors.otro_servicio = `Máximo ${LIMITS.otro_servicio} caracteres.`;
  }
  if (values.descripcion.length < DESCRIPCION_MIN) {
    errors.descripcion = `Cuéntanos con más detalle qué ofreces (mínimo ${DESCRIPCION_MIN} caracteres).`;
  } else if (values.descripcion.length > LIMITS.descripcion) {
    errors.descripcion = `Máximo ${LIMITS.descripcion} caracteres.`;
  }
  if (values.cobertura_geografica.length > LIMITS.cobertura_geografica) {
    errors.cobertura_geografica = `Máximo ${LIMITS.cobertura_geografica} caracteres.`;
  }
  if (values.disponibilidad.length > LIMITS.disponibilidad) {
    errors.disponibilidad = `Máximo ${LIMITS.disponibilidad} caracteres.`;
  }
  if (values.capacidad.length > LIMITS.capacidad) {
    errors.capacidad = `Máximo ${LIMITS.capacidad} caracteres.`;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const opt = (value: string) => (value === "" ? null : value);

  const row: OfertaRow = {
    tipo_entidad: values.tipo_entidad,
    nombre: values.nombre,
    nombre_contacto: opt(values.nombre_contacto),
    cargo_contacto: opt(values.cargo_contacto),
    telefono,
    telefono_es_whatsapp: values.telefono_es_whatsapp,
    telefono_alternativo: opt(telefonoAlternativo),
    correo: opt(correo),
    pais: values.pais,
    departamento: opt(values.departamento),
    ciudad: opt(values.ciudad),
    direccion: opt(values.direccion),
    sitio_web: opt(sitioWeb),
    redes_sociales: opt(values.redes_sociales),
    tipos_servicio: tiposServicio,
    otro_servicio: opt(values.otro_servicio),
    descripcion: values.descripcion,
    cobertura_geografica: opt(values.cobertura_geografica),
    disponibilidad: opt(values.disponibilidad),
    capacidad: opt(values.capacidad),
  };

  return { row, errors, values };
}
