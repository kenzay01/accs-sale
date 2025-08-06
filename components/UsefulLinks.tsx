"use client";

import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";

export default function UsefulLinks({
  handleMenuItemClick,
  noNeededMt = false,
}: {
  handleMenuItemClick: (itemId: string) => void;
  noNeededMt?: boolean;
}) {
  const currentLocale = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLocale);

  const menuItems = dict?.home.menu_items || [
    { id: "onas", label: "About us" },
    { id: "chasto", label: "Frequently asked questions" },
    { id: "vip", label: "VIP" },
    { id: "akcii", label: "Promotions" },
  ];
  return (
    <nav className={`${noNeededMt ? "" : "mt-8"}`}>
      <h1 className="block w-full text-left text-sm text-white px-3 py-2 rounded-lg transition-colors mb-2">
        {currentLocale === "ru" ? "Полезные ссылки" : "Useful Links"}:
      </h1>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleMenuItemClick(item.id)}
              className="block w-full text-left text-sm text-white hover:text-gray-400 hover:bg-gray-900 px-3 py-2 hover:rounded-lg transition-colors border-b-2 border-red-500"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
