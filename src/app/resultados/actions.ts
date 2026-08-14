"use server";

import { supabase } from "@/lib/supabase";
import type { EstadoOferta } from "@/lib/types";

const ESTADOS_VALIDOS: EstadoOferta[] = ["pendiente", "verificada", "descartada"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function actualizarEstado(
  id: string,
  estado: EstadoOferta,
): Promise<{ ok: boolean }> {
  if (!UUID_RE.test(id) || !ESTADOS_VALIDOS.includes(estado)) {
    return { ok: false };
  }
  const { error } = await supabase.rpc("resultados_actualizar_estado", {
    p_token: process.env.RESULTADOS_TOKEN!,
    p_id: id,
    p_estado: estado,
  });
  if (error) {
    console.error("Error actualizando estado:", error.message);
    return { ok: false };
  }
  return { ok: true };
}
