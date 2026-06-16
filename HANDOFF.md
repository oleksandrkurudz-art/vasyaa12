# HANDOFF — передача контексту для наступного чату

> Цей файл — короткий вступ для нового діалогу. Прочитай його, потім `AGENTS.md`
> (і `ТЗ.txt` за потреби). Після цього матимеш повну картину проєкту.

---

## 1. Що це і навіщо

**Громада.Новини** — локальний новинний портал для територіальної громади.
Слоган: «Новини, люди, бізнес — в одному місці».
Орієнтир: pravda.com.ua / tsn.ua, «але краще» і локально.

**Головна фішка проєкту — контекстна реклама.** Коли людина читає новину (напр., про
ремонт дороги), поряд автоматично показуються банери місцевого бізнесу, релевантного темі
(будмагазин, АЗС, кафе, банк, аптека). Рушій підбору — `src/lib/ads.ts`:
`score = (збіг тегів × 10) + (збіг категорії × 3)`, потім добір випадковою рекламою.

Повне ТЗ — у `ТЗ.txt`. Масштаб — **MVP/прототип** (демо для навчання/презентації).

---

## 2. Стек

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** · **Tailwind 4**
- **Prisma 7**: **Postgres (Supabase)** — і локально, і на проді (SQLite-версію залишено в історії git)
- ⚠️ **Це НЕ той Next.js, який ти знаєш** (див. `AGENTS.md`): API можуть відрізнятись від
  тренувальних даних. Перед написанням коду читай `node_modules/next/dist/docs/`.

### Особливості Prisma 7 (важливо!)
- У `prisma/schema.prisma` **немає `url`** у datasource — лише `provider` (`postgresql`).
- URL для міграцій — у `prisma.config.ts` (`datasource.url`), потрібен `dotenv`.
- Рантайм-клієнт — через **driver adapter** (`@prisma/adapter-pg`) у `src/lib/db.ts`.
- Згенерований клієнт — у `src/generated/prisma`, імпорт: `@/generated/prisma/client`.
- Після зміни схеми інколи треба явно `npx prisma generate` (migrate dev не завжди регенерує).

---

## 3. Структура

```
src/
  app/
    (public)/                 — публічні сторінки (мають Header + Footer)
      layout.tsx              — <main> ТЕПЕР на всю ширину (без контейнера!)
      page.tsx                — головна (герой + стрічка + сайдбар)
      [category]/page.tsx     — сторінка розділу
      [category]/[slug]/page.tsx — сторінка статті (+ контекстна реклама)
      search/page.tsx         — пошук
    admin/                    — адмінка (CRUD новин/реклами/рекламодавців)
      actions.ts              — серверні дії
      login/                  — логін
  components/                 — UI-компоненти (див. інвентар нижче)
  lib/
    ads.ts                    — рушій контекстної реклами
    articles.ts               — запити до БД (cache() для дедуплікації)
    categories.ts             — 7 розділів + SITE_NAME + SITE_SLOGAN
    auth.ts                   — cookie-сесія адмінки
    db.ts                     — Prisma singleton (driver adapter @prisma/adapter-pg)
    storage.ts                — завантаження фото у Supabase Storage (server-only, sharp)
    tags.ts, slug.ts, format.ts, images.ts
  generated/prisma/           — згенерований Prisma-клієнт
  app/icon.svg, app/icon.png  — favicon (бейдж «Г», у стилі Logo)
prisma/
  schema.prisma · seed.ts · migrations/ (Postgres init)
prisma.config.ts · next.config.ts
```

### 7 розділів (slug → назва), `src/lib/categories.ts`
`novyny` Новини громади · `polityka` Політика та рішення ради · `biznes` Бізнес громади ·
`afisha` Афіша подій · `vakansii` Вакансії · `ogoloshennya` Оголошення · `foto` Фотогалерея.

---

## 4. Команди

```bash
npm run dev          # локальний запуск, порт 3000
npm run db:seed      # демо-дані (prisma/seed.ts): 7 категорій, 5 рекламодавців, 7 новин
npx prisma migrate dev
npm run db:studio    # переглянути БД
npx tsc --noEmit     # перевірка типів
npm run lint
npx prettier --write "<files>"
```

**Адмінка:** `/admin` (логін `/admin/login`). Пароль — `ADMIN_PASSWORD` (задано в `.env` локально
й у Vercel env; у репо НЕ зберігається). `.env` у gitignore і вже містить реальні Supabase-креденшали
+ секрети — локальний `npm run dev` ходить у ту саму прод-базу Supabase.

---

## 5. Поточний стан

### ✅ Зроблено
- Повний MVP (фази 1–5): каркас, публічна частина, рушій реклами, адмінка, демо-дані.
- Перевірено end-to-end: створення новини в адмінці → показ на сайті → контекстна реклама
  підбирається коректно.
- Дизайн перероблено **під стиль ТСН** (див. розділ 6).
- Міграція на `next/image` (компонент `Cover`, blur-плейсхолдери, lazy-loading).

### ✅ Фаза 6 — Деплой (2026-06-16): ЗРОБЛЕНО
- **Живий сайт: https://vasyaa12.vercel.app** (Vercel-проєкт `vasyaa12`).
- **Репозиторій: https://github.com/oleksandrkurudz-art/vasyaa12** (гілка `main`).
- Схема: `provider = postgresql`, рантайм-адаптер `@prisma/adapter-pg` (`pg`). build = `prisma generate && next build`.
- **БД — Supabase Postgres** (не Neon): проєкт `gromada_people`, ref `pruswnyuxxaqmxrchhzu`, eu-west-3.
  Підключення — «Session pooler» (порт 5432, IPv4). Схему й демо-дані накочено через **Supabase MCP**
  (`apply_migration` + `execute_sql`), бо пароль БД через MCP не передається.
- Env на Vercel (Production): `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`. У репо секретів НЕМАЄ
  (лише локальний `.env` у gitignore). ⚠️ Пароль БД містить `@` → у `DATABASE_URL` кодується як `%40`.

### Завантаження + оптимізація фото обкладинок (2026-06-16)
- В адмінці фото вибирається з галереї → **Supabase Storage**, публічний бакет `media`.
- **Стиснення у БРАУЗЕРІ перед відправкою** — `src/components/admin/CoverUpload.tsx`
  ("use client", canvas → WebP, макс. **2048px, якість 0.9**). ⚠️ Причина критична: **Vercel ріже
  тіло запиту до serverless-функції ~4.5 МБ**, тож фото з телефона (5-8 МБ) падало з **413**
  ще до сервера. `serverActions.bodySizeLimit` тут НЕ допомагає (це нижчий платформенний ліміт).
- **Серверний sharp** — `src/lib/storage.ts` (`server-only`, service-role ключ, обходить RLS):
  запобіжник для випадку без JS. ⚠️ WebP від браузера **НЕ перекодовує повторно** (інакше —
  подвійне стиснення й видима втрата якості, вже виправлено); sharp чіпає лише сирий JPEG/PNG.
  Поле `coverFile` має пріоритет над полем URL.
- ⚠️ `sharp` — нативний модуль; Vercel не включав його у бандл → 500 "Failed to load external
  module". Фікс у `next.config`: `outputFileTracingIncludes: { "/admin/**":
  ["node_modules/sharp/**/*", "node_modules/@img/**/*"] }`.
- Env (Vercel Production + локальний `.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  (формат `sb_secret_…` — СЕКРЕТ, лише сервер).
- Форма реклами (`AdForm`) поки на URL — підключити так само: `CoverUpload` + `uploadImage(file, "ads")`.

### Нюанси деплою / що можна доробити
- GitHub-автодеплой НЕ під'єднано (акаунт Vercel без GitHub login-connection) — наразі деплой
  вручну: `vercel deploy --prod`. Щоб увімкнути авто-деплой на push: під'єднати GitHub у налаштуваннях Vercel.
- Схемою керуємо через Supabase MCP/dashboard (build не робить `migrate deploy`). Для нової міграції:
  `npx prisma migrate diff --from-empty/--from-schema ... --script` → застосувати через MCP `apply_migration`.

### UI-полірування (2026-06-16, після деплою)
- **Тікер + «Терміново» прибрано всюди**: видалено `BreakingTicker`, бейджі на картці й сторінці
  статті, чекбокс у формі адмінки, запит `getTickerArticles`, CSS-анімацію. Поле `breaking`
  лишилось у схемі (не використовується, без міграції).
- **Навігація**: липка (`NavBar.tsx`), фон `neutral-100`; ширші відступи; **бургер на телефоні**.
- **Герой**: ряд другорядних новин приховано на телефоні.
- **Перегляди показуються лише коли > 100** — хелпер `hasEnoughViews` у `src/lib/format.ts`,
  застосований у `ArticleCard`, `HeroBlock`, `Sidebar`, сторінці статті (інакше ховаємо й іконку/крапку).
- **Favicon**: `src/app/icon.svg` + `icon.png` (бейдж «Г» на синьому градієнті), дефолтний прибрано.
- **Фото обкладинок**: стиснення в браузері (2048px, q0.9) + WebP passthrough на сервері (без подвійного стиснення).

### Можливі наступні кроки (пропонувалися, не обрані)
Живі курси/погода (API НБУ), спеціалізовані розділи (Афіша з датами, Вакансії…),
іконки соцмереж/«НАЖИВО»/перемикач мови в шапці, темна тема, власна SVG-емблема замість «Г».

---

## 6. Дизайн у стилі ТСН

**Шапка** (`src/components/Header.tsx`) — темно-сіра (`neutral-900`), **2 ряди** (біжучий рядок
прибрано — див. розділ 10):
1. **Лого + сервіси**: логотип (`Logo.tsx` — градієнтний бейдж «Г» з обідком і акцент-смужкою,
   використовується і в Footer), поруч дата, праворуч — курси валют картками з прапорами 🇺🇸🇪🇺,
   пошук-пігулка «🔍 Пошук» (веде на `/search`). Ряд **на всю ширину**. Шапка НЕ липка — скролиться вгору.
2. **Меню розділів** — окремий **липкий** компонент `NavBar.tsx` (НЕ всередині `<header>`!), що
   лишається зверху при скролі. Фон — **світло-сірий** (`neutral-100`, не білий — щоб зливатися
   з темною шапкою), синя акцент-лінія (`brand-600`) зверху + тінь знизу. Меню — `NavLinks.tsx`:
   на десктопі горизонтальне (широкі відступи), **на телефоні — бургер** із випадним списком.
   (Біжучий рядок термінових прибрано — див. UI-чейнджлог у розділі 5.)

**Головна** (`HeroBlock.tsx`) — герой у стилі ТСН:
- Фонове фото головної новини **на всю ширину екрана (full-bleed)**, флеш під шапкою.
- Зверху градієнт, на ньому бейдж категорії + великий serif-заголовок + мета (дата · перегляди).
- Внизу поверх фото — **ряд із 3 другорядних новин** (мініатюра + категорія + заголовок),
  але **на телефоні цей ряд приховано** (`hidden sm:grid`) — лишається тільки головна новина.
- Бейджа «Терміново» немає.

### ⚠️ Архітектурне рішення про ширину (важливо для нових сторінок!)
`<main>` у `(public)/layout.tsx` **більше не має `max-w-7xl`** — він на всю ширину,
щоб герой міг бути full-bleed **без трюку `100vw`** (той давав зайвий горизонтальний скрол
на ширину смуги прокрутки).
**Тому кожна публічна сторінка сама обгортає свій контент** у
`<div className="mx-auto w-full max-w-7xl px-4 py-6">`. Якщо створюєш нову публічну сторінку —
не забудь цей контейнер, інакше контент розтягнеться на весь екран.

### Палітра (`src/app/globals.css`, `@theme`)
- `brand-*` — синій акцент (`brand-600 = #2563eb`).
- `urgent-*` — червоний (лишився в темі, але **більше ніде не використовується** — «Терміново» прибрано).
- Шрифти: **Inter** (текст) + **Merriweather** (заголовки, клас `font-display`), кирилиця.

---

## 7. Інвентар компонентів (`src/components/`)

| Файл | Призначення |
|------|-------------|
| `Header.tsx` | Темна шапка ТСН (2 ряди, НЕ липка) |
| `NavBar.tsx` | **Липка** смуга меню (сіра, окремо від хедера) — обгортає `NavLinks` |
| `Logo.tsx` | Фірмовий знак (size="md"/"sm"), у Header і Footer |
| `NavLinks.tsx` | Меню розділів ("use client"): десктоп — горизонт., телефон — **бургер** |
| `SearchBox.tsx` | Поле пошуку ("use client") — на сторінці `/search` |
| `HeroBlock.tsx` | Full-bleed герой (featured + 3 secondary; secondary приховано на телефоні) |
| `ArticleCard.tsx` | Картка новини у стрічці |
| `Sidebar.tsx` | Популярне 🔥 / Погода / Курси (погода й курси — статичні демо) |
| `AdSlot.tsx` | Блок контекстної реклами біля статті |
| `ShareButtons.tsx` | Кнопки поширення (Telegram/Viber/Facebook/копіювати) |
| `Cover.tsx` | Обгортка `next/image` (fill + blur + фолбек) |
| `Footer.tsx` | Підвал |
| `admin/ArticleForm.tsx`, `admin/AdForm.tsx` | Форми адмінки |
| `admin/CoverUpload.tsx` | Завантаження+стиснення обкладинки ("use client", canvas→WebP) |

_Видалено: `BreakingTicker.tsx` (біжучий рядок прибрано)._

---

## 8. Робочі нюанси / уроки

- **`preview_screenshot` часто зависає** (30s timeout) через завантаження великих зовнішніх
  фото з picsum.photos (блокують load-event). **Не покладайся на скріншоти** — перевіряй через
  `preview_eval` (DOM, `getBoundingClientRect`, fetch статусів), `preview_snapshot`,
  `preview_console_logs`. Сторінка при цьому здорова.
- Демо-фото — з `picsum.photos` (seed-и). `next.config.ts` дозволяє будь-який https-хост.
- **Не чисти `.next` і не запускай прод-білд, поки крутиться dev-сервер** — буває
  ENOENT/MODULE_NOT_FOUND. Спершу зупини dev.
- Dev-сервер у preview: конфіг `dev` у `.claude/launch.json`, порт 3000.
- Після правок: `npx tsc --noEmit` + `npm run lint` + `prettier`. Тримай код структурним
  (це окреме прохання користувача).
- Погода і курси валют у шапці/сайдбарі — **статичні демо-значення**, не живі дані.
- **Деплой — вручну**: `vercel deploy --prod --yes` (Vercel CLI залогінений як `oleksandrkurudz-art`;
  GitHub-автодеплой не під'єднано). Env додаються через `printf '%s' '<val>' | vercel env add <NAME> production`.
- **Перевірка прода без браузера**: `curl` сторінок; для адмінки — згенерувати cookie
  `admin_session = sha256("<ADMIN_PASSWORD>:<SESSION_SECRET>")` і передати в `-H "Cookie:"`.
  Реальне завантаження тестується POST-ом multipart на серверну дію (поле `$ACTION_ID_…` з HTML форми).
- **Адаптивне (бургер/приховування) перевіряти** через `preview_resize` (mobile/desktop) +
  `preview_eval` (`getComputedStyle().display`, `offsetWidth`), бо `curl` не бачить медіа-брейкпойнтів.
- **Supabase MCP** активний (project ref `pruswnyuxxaqmxrchhzu`): `execute_sql`/`apply_migration`
  для схеми й даних; пароль БД і service-role ключ MCP НЕ віддає (їх дає користувач).

---

## 9. Користувач і стиль роботи

- Спілкування — **українською**. Користувач — не глибокий технар, мислить продуктово/візуально
  («розтягни», «зроби як в ТСН», «виглядає як заглушка»). Цінує візуальний результат і пояснення.
- Дизайн-вектор (з ранніх ітерацій): сучасний мінімалізм, **синій акцент**, червоний для
  термінового; Merriweather для заголовків + Inter для тексту; менше білого простору, більше
  контрасту між секціями.
- Є файли пам'яті: `C:\Users\oleks\.claude\projects\D--project-vasya\memory\`
  (`news-site-project.md` + `MEMORY.md`-індекс).

---

_Останнє оновлення: 2026-06-16. У цій сесії: деплой на Vercel + міграція на Supabase Postgres;
завантаження+стиснення фото обкладинок; favicon; UI-полірування (тікер/«Терміново» прибрано,
липка сіра навігація, бургер на телефоні, перегляди лише >100, герой без secondary на телефоні).
Живий сайт — https://vasyaa12.vercel.app._
