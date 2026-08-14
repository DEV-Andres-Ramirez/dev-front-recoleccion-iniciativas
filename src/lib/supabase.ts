import { createClient } from "@supabase/supabase-js";

// Cliente para uso exclusivo en el servidor (server actions). El formulario no
// tiene autenticación: la key publishable solo permite INSERT bajo RLS.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);
