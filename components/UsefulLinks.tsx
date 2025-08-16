"use client";

import React, { useState } from "react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
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
  const { pages } = useItemContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

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
      <ul className="space-y-2">
        {pages.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleLinkClick(item.id)}
              className="block w-full text-left text-sm text-white hover:text-gray-400 hover:bg-gray-900 px-3 py-2 hover:rounded-lg transition-colors border-b-2 border-red-500"
            >
              {currentLanguage === "ru" ? item.title_ru : item.title_en}
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
