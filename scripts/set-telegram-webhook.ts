/**
 * Одноразова реєстрація Telegram-вебхука на прод-URL.
 *
 * Запуск:
 *   npx tsx scripts/set-telegram-webhook.ts https://vasyaa12.vercel.app
 * (URL можна не вказувати — тоді береться SITE_URL або прод-домен за замовч.)
 *
 * Потрібні env (із .env): TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET.
 */
import "dotenv/config";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token) throw new Error("Не задано TELEGRAM_BOT_TOKEN у .env");
  if (!secret) throw new Error("Не задано TELEGRAM_WEBHOOK_SECRET у .env");

  const base =
    process.argv[2] ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://vasyaa12.vercel.app";
  const url = `${base.replace(/\/$/, "")}/api/telegram`;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ["message", "callback_query"],
      }),
    },
  );
  const json = await res.json();
  console.log("setWebhook →", JSON.stringify(json, null, 2));
  console.log("Вебхук:", url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
