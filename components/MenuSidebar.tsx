"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import UsefulLinks from "./UsefulLinks";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;

  onMenuItemClick?: (itemId: string) => void;
}

export default function MenuSidebar({
  isOpen,
  onClose,

  onMenuItemClick,
}: MenuSidebarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentLocale = useCurrentLanguage();
  // const { dict } = useDictionary(currentLocale as Locale);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMenuItemClick = (itemId: string) => {
    onMenuItemClick?.(itemId);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-all duration-300 z-[70] ${
          isAnimating ? "bg-black/50" : "bg-black/0"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 flex flex-col justify-between h-full bg-gray-950 w-64 shadow-lg z-[70] transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-full"
              />
              <h1 className="text-sm">DIABET</h1>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <UsefulLinks handleMenuItemClick={handleMenuItemClick} />
        </div>
        <div className="p-4 border-t border-red-500">
          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
      </div>
    </>
  );
}
