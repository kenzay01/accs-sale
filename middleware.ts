import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Виключаємо static files (зображення, css, js тощо)
  const staticFileExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".css",
    ".js",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".pdf",
    ".zip",
    ".json",
    ".xml",
    ".txt",
    ".mp4",
  ];

  const isStaticFile = staticFileExtensions.some((ext) =>
    pathname.toLowerCase().endsWith(ext)
  );

  // Якщо це static file, пропускаємо middleware
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Отримуємо мову з cookies
  const savedLocale = request.cookies.get("preferredLocale")?.value;

  // Перевіряємо, чи шлях вже містить локаль
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Якщо шлях не містить локаль
  if (pathnameIsMissingLocale) {
    // Використовуємо збережену мову, якщо є, інакше дефолтну
    const locale =
      savedLocale && locales.includes(savedLocale as (typeof locales)[number])
        ? (savedLocale as (typeof locales)[number])
        : defaultLocale;

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
