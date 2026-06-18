import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_SLOGAN, SITE_URL } from "@/lib/categories";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

// Unbounded — виразний дисплейний шрифт (повна кирилиця) для заголовків/логотипа.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  // metadataBase робить відносні URL (canonical, og:image) абсолютними.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_SLOGAN}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_SLOGAN,
  // Дефолтні OG/Twitter для всього сайту; сторінки статей їх доповнюють/перекривають.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "uk_UA",
    title: `${SITE_NAME} — ${SITE_SLOGAN}`,
    description: SITE_SLOGAN,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_SLOGAN}`,
    description: SITE_SLOGAN,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-neutral-900">{children}</body>
    </html>
  );
}
