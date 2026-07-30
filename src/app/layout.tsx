import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="min-h-full bg-white text-neutral-900">
        {children}
        {/* Plerdy — теплові карти / аналітика поведінки (site hash 79371).
            Inline-скрипт вантажиться після інтерактивності (аналог «перед </body>»). */}
        <Script id="plerdy-code" data-plerdy_code="1" strategy="afterInteractive">
          {`(function(w,d){
  if(w.__plerdyCode)return;
  w.__plerdyCode=1;
  w._protocol=w.location.protocol=="https:"?"https://":"http://";
  w._site_hash_code="fe573b79e16538105ad87fe2c080d8ca";
  w._suid=79371;
  var s=d.createElement("script");
  s.async=true;
  s.referrerPolicy="strict-origin-when-cross-origin";
  s.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
  d.head.appendChild(s);
})(window,document);`}
        </Script>
      </body>
    </html>
  );
}
