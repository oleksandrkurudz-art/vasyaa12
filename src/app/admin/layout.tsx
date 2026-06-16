import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SITE_NAME } from "@/lib/categories";

async function logoutAction() {
  "use server";
  await logout();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await isAuthenticated();

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">
              {SITE_NAME} · Адмінка
            </Link>
            {authed && (
              <nav className="flex gap-4 text-sm text-neutral-300">
                <Link href="/admin/articles" className="hover:text-white">
                  Новини
                </Link>
                <Link href="/admin/ads" className="hover:text-white">
                  Реклама
                </Link>
                <Link href="/admin/advertisers" className="hover:text-white">
                  Рекламодавці
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-300 hover:text-white">
              ↗ На сайт
            </Link>
            {authed && (
              <form action={logoutAction}>
                <button className="text-neutral-300 hover:text-white">
                  Вийти
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
