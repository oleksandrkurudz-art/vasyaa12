import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Політика конфіденційності",
  description: `Як ${SITE_NAME} обробляє персональні дані та використовує cookie.`,
};

// Контакт для звернень щодо персональних даних.
const CONTACT_EMAIL = "gromada.novunu@gmail.com";
// Дата останнього оновлення тексту політики (не дата рендеру).
const UPDATED = "24 липня 2026 р.";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <article className="space-y-6">
        <header className="space-y-2 border-b border-neutral-200 pb-6">
          <h1 className="font-display text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Політика конфіденційності
          </h1>
          <p className="text-sm text-neutral-500">Оновлено: {UPDATED}</p>
        </header>

        <p className="text-neutral-700">
          Ця Політика пояснює, які дані збирає сайт «{SITE_NAME}» ({SITE_URL}),
          навіщо та як ми їх використовуємо. Користуючись сайтом, ви
          погоджуєтеся з умовами цієї Політики.
        </p>

        <Section title="1. Хто обробляє дані">
          <p>
            Розпорядником даних є редакція «{SITE_NAME}». З усіх питань щодо
            обробки персональних даних звертайтеся на пошту{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="2. Які дані ми збираємо">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Технічні файли cookie</strong> — лише необхідні для роботи
              сайту (див. розділ 3). Реклами й трекінгу немає.
            </li>
            <li>
              <strong>Технічні дані з’єднання</strong> — IP-адреса, тип
              браузера, час запиту тощо. Їх автоматично фіксує наш хостинг для
              безпеки та стабільної роботи сайту.
            </li>
            <li>
              <strong>Дані, які ви надаєте добровільно</strong> — якщо в
              майбутньому ви заповнюєте форму на сайті (наприклад, оголошення,
              вакансію чи заявку на бізнес-картку), ми обробляємо лише ті дані,
              які ви самі вказали.
            </li>
          </ul>
          <p>
            Ми <strong>не</strong> збираємо чутливі персональні дані та не
            купуємо їх у третіх сторін.
          </p>
        </Section>

        <Section title="3. Файли cookie">
          <p>Сайт використовує лише технічні (необхідні) cookie:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm">
                community
              </code>{" "}
              — запам’ятовує обрану вами громаду, щоб показувати відповідні
              новини. Зберігається до року.
            </li>
            <li>
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm">
                admin_session
              </code>{" "}
              — використовується лише для входу редакції в панель керування.
              Звичайних відвідувачів не стосується.
            </li>
          </ul>
          <p>
            Ці cookie не використовуються для реклами чи стеження. Тому окремого
            банера згоди на cookie сайт не показує. Ви можете видалити або
            заблокувати cookie в налаштуваннях браузера — сайт працюватиме, але
            вибір громади не збережеться.
          </p>
        </Section>

        <Section title="4. Навіщо ми обробляємо дані">
          <ul className="list-disc space-y-2 pl-5">
            <li>щоб сайт коректно працював і зберігав ваші налаштування;</li>
            <li>щоб убезпечити сайт від зловживань і технічних збоїв;</li>
            <li>
              щоб опрацювати звернення чи заявки, які ви надсилаєте добровільно.
            </li>
          </ul>
          <p>
            Правові підстави — ваша згода та законний інтерес у забезпеченні
            роботи й безпеки сайту.
          </p>
        </Section>

        <Section title="5. Кому ми передаємо дані">
          <p>
            Ми не продаємо й не передаємо ваші дані третім сторонам для реклами.
            Технічно дані обробляються нашими постачальниками послуг:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Хостинг сайту</strong> — платформа Vercel (розміщення та
              захист сайту);
            </li>
            <li>
              <strong>База даних і сховище</strong> — платформа Supabase
              (зберігання контенту сайту, сервери в ЄС).
            </li>
          </ul>
          <p>
            Ці постачальники обробляють дані лише для надання нам послуг і згідно
            з власними політиками захисту даних.
          </p>
        </Section>

        <Section title="6. Скільки ми зберігаємо дані">
          <p>
            Cookie зберігаються протягом строку, вказаного в розділі 3. Технічні
            журнали хостингу зберігаються обмежений час і використовуються лише
            для безпеки. Дані з форм зберігаються стільки, скільки потрібно для
            обробки вашого звернення.
          </p>
        </Section>

        <Section title="7. Ваші права">
          <p>Ви маєте право:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>дізнатися, які ваші дані ми обробляємо;</li>
            <li>виправити неточні дані;</li>
            <li>вимагати видалення своїх даних;</li>
            <li>відкликати згоду на обробку.</li>
          </ul>
          <p>
            Щоб скористатися будь-яким із цих прав, напишіть на{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="8. Захист даних">
          <p>
            З’єднання із сайтом захищене шифруванням (HTTPS). Доступ до панелі
            керування захищений паролем і підписаною сесією. Ми вживаємо
            розумних технічних заходів для захисту даних від несанкціонованого
            доступу.
          </p>
        </Section>

        <Section title="9. Діти">
          <p>
            Сайт не орієнтований на дітей і не збирає свідомо їхні персональні
            дані.
          </p>
        </Section>

        <Section title="10. Зміни до Політики">
          <p>
            Ми можемо оновлювати цю Політику. Актуальна версія завжди доступна на
            цій сторінці із зазначенням дати оновлення вгорі.
          </p>
        </Section>

        <p className="border-t border-neutral-200 pt-6 text-sm text-neutral-500">
          Повернутися на{" "}
          <Link href="/" className="font-medium text-brand-700 hover:underline">
            головну
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold text-neutral-900">
        {title}
      </h2>
      <div className="space-y-3 leading-relaxed text-neutral-700">
        {children}
      </div>
    </section>
  );
}
