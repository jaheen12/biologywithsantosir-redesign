import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Serif_Bengali, Tiro_Bangla } from "next/font/google";
import { SearchProvider } from "@/context/SearchContext";
import "./globals.css";

// Same font setups below
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto",
  display: "swap",
});

const tiroBangla = Tiro_Bangla({
  weight: "400",
  subsets: ["bengali"],
  variable: "--font-tiro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'BiologywithSantosir — জীববিজ্ঞান শেখো সহজভাবে',
    template: '%s | BiologywithSantosir',
  },
  description: 'SSC, HSC ও Honours স্তরের জীববিজ্ঞান বাংলায় শিখুন — Santo Sir-এর সাথে।',
  metadataBase: new URL('https://biologywithsantosir.com'),
  openGraph: {
    siteName: 'BiologywithSantosir',
    locale: 'bn_BD',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${jetbrainsMono.variable} ${notoSerifBengali.variable} ${tiroBangla.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
          প্রধান কন্টেন্টে যান
        </a>
        <SearchProvider>
          {children}
        </SearchProvider>
      </body>
    </html>
  );
}
