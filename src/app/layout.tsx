import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_SLOGAN}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_SLOGAN,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-neutral-900">{children}</body>
    </html>
  );
}
