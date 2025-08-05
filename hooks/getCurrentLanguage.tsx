"use client";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { locales, Locale } from "@/i18n/config";

export function useCurrentLanguage(): string {
  const pathname = usePathname();

  return useMemo(() => {
    const pathLocale = pathname.split("/")[1] as Locale;
    if (locales.includes(pathLocale)) {
      return pathLocale as Locale;
    }
    return "ru" as Locale;
  }, [pathname]);
}
