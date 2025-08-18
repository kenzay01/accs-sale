import { Inter } from "next/font/google";
import { locales } from "@/i18n/config";
import { Metadata } from "next";
import Script from "next/script";
import "../globals.css";
import { ItemProvider } from "@/context/itemsContext";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Accounts Sale",
    description: "Accounts Sale - Buy and Sell Accounts",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=0"
        />
      </head>
      <body className={inter.className}>
        <ItemProvider>
          <main>{children}</main>
          <div id="modal-root"></div>
        </ItemProvider>
      </body>
    </html>
  );
}
