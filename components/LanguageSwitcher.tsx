"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames } from "@/i18n/config";
import { useEffect, useState } from "react";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const pathname = usePathname();
  // const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   // Check window width to determine if it's mobile
  //   const updateIsMobile = () => {
  //     if (typeof window !== "undefined") {
  //       setIsMobile(window.innerWidth < 640);
  //     }
  //   };

  //   // Initial check
  //   updateIsMobile();

  //   // Add resize event listener
  //   window.addEventListener("resize", updateIsMobile);

  //   // Cleanup
  //   return () => window.removeEventListener("resize", updateIsMobile);
  // }, []);

  useEffect(() => {
    localStorage.setItem("preferredLocale", currentLocale);
    document.cookie = `preferredLocale=${currentLocale}; path=/; max-age=31536000`;
  }, [currentLocale]);

  const getLocalizedPath = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  // const isHomePage = pathname === `/${currentLocale}`;

  return (
    <div className="flex items-center md:space-x-1 mb-1">
      {locales.map((locale, index) => (
        <div key={locale} className="flex items-center">
          <Link
            href={getLocalizedPath(locale)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentLocale === locale
                ? "bg-gray-900 text-red-500"
                : "text-gray-300 hover:text-gray-900 hover:bg-gray-400"
            }`}
          >
            {localeNames[locale]}
          </Link>
          {index < locales.length - 1 && (
            <span className="text-gray-400 mx-1">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
