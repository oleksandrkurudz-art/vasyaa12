import Link from "next/link";

export const metadata = { title: "Сторінку не знайдено" };

// Показується, коли сторінка викликає notFound() (видалена/неопублікована
// новина, неіснуючий розділ) або адреси немає.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-6xl font-black text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        Сторінку не знайдено
      </h1>
      <p className="mt-3 text-neutral-600">
        Можливо, новину видалено, ще не опубліковано або адреса змінилася.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        На головну
      </Link>
    </div>
  );
}
