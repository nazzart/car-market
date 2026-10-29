// Обновление сессии Supabase на каждом запросе (вызывается из proxy.ts): истёкший токен меняется на новый
// и записывается в cookie ответа, чтобы страницы и Server Actions видели вошедшего пользователя
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export async function refreshSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    }
  );

  // getClaims проверяет подпись токена локально и при необходимости обновляет его
  await supabase.auth.getClaims();
  return response;
}
