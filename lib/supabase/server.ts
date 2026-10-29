// Supabase на сервере (Server Components, Server Actions, маршруты API): вход, выход, текущий пользователь.
// Сессия — в cookie, поэтому сервер знает, кто сделал запрос. Данные сайта читаются не отсюда, а через lib/db
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabase() {
  const store = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // из Server Component cookie менять нельзя — это сделает proxy.ts при следующем запросе
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {}
      },
    },
  });
}
