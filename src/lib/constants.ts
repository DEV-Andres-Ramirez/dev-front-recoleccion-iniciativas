// Fuente única de verdad para el formulario y el seed de la base de datos.
// Los códigos deben coincidir exactamente con los CHECK y el seed de las
// migraciones de Supabase (tablas categorias_servicio y ofertas_ayuda).

export const SERVICE_CATEGORIES = [
  { codigo: "donaciones_dinero", nombre: "Donaciones en dinero" },
  { codigo: "donaciones_viveres", nombre: "Víveres y alimentos" },
  { codigo: "donaciones_ropa", nombre: "Ropa y abrigo" },
  { codigo: "donaciones_medicamentos", nombre: "Medicamentos e insumos médicos" },
  { codigo: "atencion_medica", nombre: "Atención médica" },
  { codigo: "salud_mental", nombre: "Salud mental y apoyo psicosocial" },
  { codigo: "busqueda_rescate", nombre: "Búsqueda y rescate" },
  { codigo: "busqueda_desaparecidos", nombre: "Búsqueda de personas desaparecidas" },
  { codigo: "transporte_personas", nombre: "Transporte de personas" },
  { codigo: "transporte_carga", nombre: "Transporte de carga y recursos" },
  { codigo: "alojamiento_temporal", nombre: "Alojamiento temporal" },
  { codigo: "alimentacion", nombre: "Alimentación y comedores" },
  { codigo: "agua_saneamiento", nombre: "Agua y saneamiento" },
  { codigo: "energia_comunicaciones", nombre: "Energía y comunicaciones" },
  { codigo: "maquinaria_equipos", nombre: "Maquinaria y equipos" },
  { codigo: "voluntariado", nombre: "Voluntariado" },
  { codigo: "asistencia_legal", nombre: "Asistencia legal" },
  { codigo: "apoyo_ninez", nombre: "Apoyo a la niñez" },
  { codigo: "apoyo_animales", nombre: "Apoyo a animales" },
  { codigo: "construccion", nombre: "Construcción y reconstrucción" },
  { codigo: "educacion", nombre: "Educación" },
  { codigo: "otro", nombre: "Otro tipo de ayuda" },
] as const;

export const SERVICE_CATEGORY_CODES = SERVICE_CATEGORIES.map((c) => c.codigo);

export const ENTITY_TYPES = [
  { codigo: "persona", nombre: "Persona natural" },
  { codigo: "organizacion_social", nombre: "Organización social o comunitaria" },
  { codigo: "fundacion_ong", nombre: "Fundación / ONG" },
  { codigo: "empresa", nombre: "Empresa" },
  { codigo: "institucion_educativa", nombre: "Institución educativa" },
  { codigo: "entidad_publica", nombre: "Entidad pública" },
  { codigo: "iglesia_comunidad", nombre: "Iglesia o comunidad religiosa" },
  { codigo: "otro", nombre: "Otro" },
] as const;

export const ENTITY_TYPE_CODES = ENTITY_TYPES.map((t) => t.codigo);

export const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
] as const;

// Espejo de los CHECK de longitud de la tabla ofertas_ayuda.
export const LIMITS = {
  nombre: 200,
  nombre_contacto: 200,
  cargo_contacto: 150,
  telefono: 30,
  telefono_alternativo: 30,
  correo: 254,
  pais: 100,
  departamento: 100,
  ciudad: 120,
  direccion: 300,
  sitio_web: 300,
  redes_sociales: 500,
  otro_servicio: 200,
  descripcion: 3000,
  cobertura_geografica: 300,
  disponibilidad: 300,
  capacidad: 500,
} as const;

export const DESCRIPCION_MIN = 20;
