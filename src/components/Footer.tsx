import Link from "next/link";
import Logo from "@/components/Logo";
import { CATEGORIES, SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo size="sm" tone="onLight" />
            <p className="mt-3 text-sm text-neutral-500">{SITE_SLOGAN}</p>
          </div>
          <nav>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Розділи
            </p>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className="text-neutral-600 hover:text-brand-700"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/kataloh"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  Каталог бізнесу
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Усі права захищено.
          </p>
          <Link
            href="/pryvatnist"
            className="hover:text-brand-700"
          >
            Політика конфіденційності
          </Link>
        </div>
      </div>
    </footer>
  );
}
