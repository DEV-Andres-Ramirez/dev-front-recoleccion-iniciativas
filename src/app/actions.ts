"use server";

import { supabase } from "@/lib/supabase";
import { validateOferta, type FormState } from "@/lib/validation";

export async function submitOferta(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot: los bots suelen llenar todos los campos; una persona nunca ve este.
  const honeypot = formData.get("sitio_web_confirmacion");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true };
  }

  const { row, errors, values } = validateOferta(formData);
  if (!row) {
    return { ok: false, errors, values };
  }

  const { error } = await supabase.from("ofertas_ayuda").insert(row);
  if (error) {
    console.error("Error insertando en ofertas_ayuda:", error.message);
    return {
      ok: false,
      formError:
        "No pudimos guardar tu registro. Inténtalo de nuevo en unos minutos; tu información sigue diligenciada.",
      values,
    };
  }

  return { ok: true };
}
