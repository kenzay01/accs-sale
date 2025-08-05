import { Inter } from "next/font/google";
import { locales } from "@/i18n/config";
import { Metadata } from "next";
import Script from "next/script";
// import Header from "@/components/Header";
// import ClientHeaderWrapper from "@/components/ClientHeaderWrapper";
// import Footer from "@/components/Footer";
import "../globals.css";
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// This function generates metadata for the root layout.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Accounts Sale",
    description: "Accounts Sale - Buy and Sell Accounts",
    // Можете додати специфічні для локалі метадані
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <header>
        <Script src="https://telegram.org/js/telegram-web-app.js" />
      </header>
      <body className={inter.className}>
        {/* <ClientHeaderWrapper /> */}
        <main>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
