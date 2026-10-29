import { NextResponse, type NextRequest } from "next/server";

import { createSupabase } from "@/lib/supabase/server";

// Ссылки из писем Supabase (смена пароля, позже — подтверждение email) приходят сюда с одноразовым кодом:
// меняем его на сессию и отправляем дальше. next — только путь на нашем сайте, не чужой адрес
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  return NextResponse.redirect(new URL(`${safeNext}?expired=1`, url.origin));
}
