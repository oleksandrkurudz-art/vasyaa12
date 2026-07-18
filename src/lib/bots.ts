// Груба евристика для відсіву «нелюдського» трафіку від лічильника переглядів:
// пошукові краулери, прев'ю-фетчери соцмереж/месенджерів, автоматичні агенти.
// Не ідеальна (UA легко підробити), але прибирає найтиповіше сміття, що
// накручувало б блок «Популярне».
const BOT_RE =
  /bot\b|bots\b|crawl|spider|slurp|mediapartners|facebookexternalhit|facebot|telegram|whatsapp|viber|skype|discord|twitter|linkedin|embedly|preview|pinterest|reddit|applebot|yandex|bingpreview|inspectiontool|headlesschrome|lighthouse|prerender|monitor|curl|wget|python-requests|axios|go-http/i;

/** true, якщо User-Agent схожий на бота/автомат (або відсутній). */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // справжні браузери завжди шлють User-Agent
  return BOT_RE.test(userAgent);
}
