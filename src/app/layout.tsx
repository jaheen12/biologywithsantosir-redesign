import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Serif_Bengali, Hind_Siliguri, Tiro_Bangla } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SearchProvider } from "@/context/SearchContext";
import SearchModal from "@/components/search/SearchModal";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";
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

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable} ${tiroBangla.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <SearchProvider>
          <PublicLayoutWrapper
            navbar={<Navbar />}
            footer={<Footer />}
            searchModal={<SearchModal />}
          >
            {children}
          </PublicLayoutWrapper>
        </SearchProvider>
      </body>
    </html>
  );
}
