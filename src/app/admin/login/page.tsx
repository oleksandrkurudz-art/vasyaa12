import { redirect } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";

export const metadata = { title: "Вхід в адмінку" };

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-neutral-900">Вхід в адмінку</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Введіть пароль адміністратора.
      </p>
      <form action={loginAction} className="mt-5 space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          autoFocus
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {error && (
          <p className="text-sm text-red-600">Невірний пароль. Спробуйте ще раз.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Увійти
        </button>
      </form>
    </div>
  );
}
