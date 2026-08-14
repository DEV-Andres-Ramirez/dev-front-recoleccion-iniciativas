import type { FormState } from "@/lib/validation";

// Fila completa de public.ofertas_ayuda tal como la devuelve resultados_listar.
export type EstadoOferta = "pendiente" | "verificada" | "descartada";

export type Oferta = {
  id: string;
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
  estado: EstadoOferta;
  notas_internas: string | null;
  created_at: string;
  updated_at: string;
};

// Estado del formulario de edición en /resultados: igual al del formulario
// público, más la fila actualizada que devuelve la base al guardar.
export type EditState = FormState & { oferta?: Oferta };
