"use server";

import { cookies } from "next/headers";
import { COMMUNITY_COOKIE } from "@/lib/community-filter";

// Зберегти/скинути вибір громади. Порожній slug = весь район (видаляємо cookie).
export async function setCommunity(slug: string) {
  const store = await cookies();
  if (slug) {
    store.set(COMMUNITY_COOKIE, slug, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // рік
    });
  } else {
    store.delete(COMMUNITY_COOKIE);
  }
}
