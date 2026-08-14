"use server";

import { supabase } from "@/lib/supabase";
import { validateOferta } from "@/lib/validation";
import type { EditState, EstadoOferta, Oferta } from "@/lib/types";

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

const NOTAS_MAX = 2000;

export async function actualizarOferta(
  id: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  if (!UUID_RE.test(id)) {
    return { ok: false, formError: "Registro inválido." };
  }

  const { row, errors, values } = validateOferta(formData);
  if (!row) {
    return { ok: false, errors, values };
  }

  const notasRaw = formData.get("notas_internas");
  const notas =
    typeof notasRaw === "string" ? notasRaw.trim().slice(0, NOTAS_MAX) : "";

  const { data, error } = await supabase.rpc("resultados_actualizar_oferta", {
    p_token: process.env.RESULTADOS_TOKEN!,
    p_id: id,
    p_datos: { ...row, notas_internas: notas === "" ? null : notas },
  });

  if (error || !data?.[0]) {
    console.error("Error actualizando oferta:", error?.message ?? "sin fila");
    return {
      ok: false,
      formError: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
      values,
    };
  }

  return { ok: true, oferta: data[0] as Oferta };
}
