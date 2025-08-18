"use client";

import React, { useState } from "react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { useItemContext } from "@/context/itemsContext";
import Modal from "./Modal";

export default function UsefulLinks({
  handleMenuItemClick,
  noNeededMt = false,
}: {
  handleMenuItemClick?: (itemId: string) => void;
  noNeededMt?: boolean;
}) {
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);
  const { pages } = useItemContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  const menuItems = [
    { id: "about", label: dict?.usefulLinks.aboutUs || "About Us" },
    { id: "faq", label: dict?.usefulLinks.faq || "FAQ" },
    { id: "promotions", label: dict?.usefulLinks.promotions || "Promotions" },
    {
      id: "terms",
      label: dict?.usefulLinks.termsConditions || "Terms & Conditions",
    },
    {
      id: "partner",
      label: dict?.usefulLinks.partnerWithUs || "Partner with Us",
    },
  ];

  const handleLinkClick = (id: string) => {
    setSelectedLink(id);
    setIsOpen(true);
    if (handleMenuItemClick) {
      handleMenuItemClick(id);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedLink(null);
  };

  const selectedPage = pages.find((page) => page.id === selectedLink);

  return (
    <nav className={`${noNeededMt ? "" : "mt-8"}`}>
      <h1 className="block w-full text-left text-sm text-white px-3 py-2 rounded-lg transition-colors mb-2">
        {currentLanguage === "ru" ? "Полезные ссылки" : "Useful Links"}:
      </h1>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleLinkClick(item.id)}
              className="block w-full text-left text-sm text-white hover:text-gray-400 hover:bg-gray-900 px-3 py-2 hover:rounded-lg transition-colors border-b-2 border-red-500"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      {selectedPage && (
        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          title={
            currentLanguage === "ru"
              ? selectedPage.title_ru
              : selectedPage.title_en
          }
          content={
            selectedPage.content_type === "faq"
              ? currentLanguage === "ru"
                ? selectedPage.content_ru
                : selectedPage.content_en
              : currentLanguage === "ru"
              ? selectedPage.content_ru
              : selectedPage.content_en
          }
          contentType={selectedPage.content_type}
        />
      )}
    </nav>
  );
}
