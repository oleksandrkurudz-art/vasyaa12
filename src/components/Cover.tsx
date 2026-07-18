import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/images";

// Через оптимізатор next/image (проксі /_next/image) пропускаємо ЛИШЕ наш
// Supabase Storage — він у allowlist у next.config. Будь-які інші URL, що їх
// вставив редактор (img.tsn.ua, *.gov.ua тощо), віддаємо як є (unoptimized):
// так вони рендеряться з будь-якого хоста й не тримають відкритий проксі.
const OPTIMIZED_HOST = "pruswnyuxxaqmxrchhzu.supabase.co";

function isOptimizable(src: string): boolean {
  try {
    return new URL(src).hostname === OPTIMIZED_HOST;
  } catch {
    return false; // відносні шляхи / некоректні URL — без оптимізатора
  }
}

type Props = {
  src?: string | null;
  alt: string;
  /** Значення `sizes` для адаптивної оптимізації next/image. */
  sizes: string;
  /** Класи для самого зображення (наприклад, object-cover та hover-ефект). */
  imgClassName?: string;
  /** true для зображень «над згином» (hero) — вантажиться одразу, без lazy. */
  priority?: boolean;
};

/**
 * Обкладинка на базі next/image (fill). Батьківський елемент має бути
 * `relative` із заданим співвідношенням сторін. Якщо src відсутній —
 * показуємо нейтральну заглушку (next/image не оптимізує SVG).
 */
export default function Cover({
  src,
  alt,
  sizes,
  imgClassName = "",
  priority = false,
}: Props) {
  if (!src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200"
        aria-hidden
      >
        <span className="font-display text-3xl font-black text-neutral-300">Г</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      priority={priority}
      unoptimized={!isOptimizable(src)}
      className={imgClassName}
    />
  );
}
