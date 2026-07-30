<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Проєкт: НРГ

Регіональний новинний портал. Повна назва — «НРГ — Незалежний регіональний голос».
Бренд: знак — «НРГ» трьома квадратними плашками у стилі BBC (`src/components/Logo.tsx`),
контекстний колір (`tone`): на чорній шапці — білі плашки з чорними літерами, на
світлому (підвал/компактний бар) — навпаки. Шапка — чорна (`neutral-950`);
фірмовий синій (`brand-600`) лишився акцентом дій/активних пунктів, не в лого.
Назва й слоган — константи `SITE_NAME`/`SITE_SLOGAN` у `src/lib/categories.ts`
(єдине джерело: метадані, OG, підвал, адмінка, промпт копірайтера).
ТЗ — у `ТЗ.txt` (писане ще під стару назву «Громада.Новини», ребрендинг — 2026-07).

## Стек
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Prisma 7 (Postgres — Supabase локально й на проді).
Prisma 7: URL для міграцій у `prisma.config.ts`; рантайм-клієнт через driver-адаптер (`@prisma/adapter-pg`) у `src/lib/db.ts`. `DATABASE_URL` — connection string Postgres (Supabase «Session pooler»). Згенерований клієнт — `src/generated/prisma` (імпорт `@/generated/prisma/client`).

## Структура
- `src/app/(public)/` — публічні сторінки (головна, `[category]`, `[category]/[slug]`, каталог `kataloh`/`kataloh/[slug]`) з шапкою/підвалом.
- `src/app/admin/` — адмінка (логін, CRUD новин/реклами/бізнесів). Серверні дії — `src/app/admin/actions.ts`.
- `src/lib/ads.ts` — **рушій контекстної реклами** (score = збіг тегів×10 + збіг категорії×3, добір загальною рекламою). Банер належить `Business` і за замовчуванням веде на його картку.
- `src/lib/businesses.ts` + `src/lib/business-categories.ts` — каталог бізнесу (`/kataloh`): дата-шар, видимість (`active && paidUntil`), категорії.
- `src/lib/categories.ts` — канонічний список розділів новин (джерело для меню + seed).
- Теги зберігаються рядком через кому (`src/lib/tags.ts`) — формат лишився з SQLite-версії, рушій реклами на нього розрахований.

## Команди
- `npm run dev` — локальний запуск (порт 3000).
- `npm run db:seed` — наповнити демо-даними (`prisma/seed.ts`).
- `npx prisma migrate dev` — міграції. `npm run db:studio` — переглянути БД.

## Адмінка
`/admin` (логін `/admin/login`). Пароль — `ADMIN_PASSWORD` у `.env` (локально `admin`). Сесія — підписаний cookie (`src/lib/auth.ts`).

