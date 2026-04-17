import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  Hind_Siliguri,
  Inter,
  JetBrains_Mono,
  Noto_Naskh_Arabic,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Bengali,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultLocale, isLocale, localeCookieName, localeDirection, type Locale } from "@/lib/i18n/config";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shikkha Platform — School & Madrasa Management",
    template: "%s · Shikkha",
  },
  description:
    "Complete management platform for schools and madrasas in Bangladesh — admissions, attendance, exams, fees, parent portal & more. Available in বাংলা, English, اردو, العربية.",
  applicationName: "Shikkha",
  keywords: [
    "school management",
    "madrasa management",
    "bangladesh",
    "bornomala alternative",
    "hifz",
    "sabaq",
    "bangla",
    "শিক্ষা",
    "مدرسہ",
    "مدرسة",
  ],
  authors: [{ name: "Shikkha Platform" }],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${hindSiliguri.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSansBengali.variable} ${notoNaskhArabic.variable} ${notoNastaliqUrdu.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
          <InstallPrompt />
          <RegisterServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
