<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Проєкт: Громада.Новини

Локальний новинний портал. Слоган: «Новини, люди, бізнес — в одному місці».
ТЗ — у `ТЗ.txt`.

## Стек
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Prisma 7 (Postgres — Supabase локально й на проді).
Prisma 7: URL для міграцій у `prisma.config.ts`; рантайм-клієнт через driver-адаптер (`@prisma/adapter-pg`) у `src/lib/db.ts`. `DATABASE_URL` — connection string Postgres (Supabase «Session pooler»). Згенерований клієнт — `src/generated/prisma` (імпорт `@/generated/prisma/client`).

## Структура
- `src/app/(public)/` — публічні сторінки (головна, `[category]`, `[category]/[slug]`) з шапкою/підвалом.
- `src/app/admin/` — адмінка (логін, CRUD новин/реклами/рекламодавців). Серверні дії — `src/app/admin/actions.ts`.
- `src/lib/ads.ts` — **рушій контекстної реклами** (score = збіг тегів×10 + збіг категорії×3, добір загальною рекламою).
- `src/lib/categories.ts` — канонічний список 7 розділів (джерело для меню + seed).
- Теги зберігаються рядком через кому (`src/lib/tags.ts`) — формат лишився з SQLite-версії, рушій реклами на нього розрахований.

## Команди
- `npm run dev` — локальний запуск (порт 3000).
- `npm run db:seed` — наповнити демо-даними (`prisma/seed.ts`).
- `npx prisma migrate dev` — міграції. `npm run db:studio` — переглянути БД.

## Адмінка
`/admin` (логін `/admin/login`). Пароль — `ADMIN_PASSWORD` у `.env` (локально `admin`). Сесія — підписаний cookie (`src/lib/auth.ts`).

