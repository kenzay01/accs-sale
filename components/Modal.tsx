"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemId: string | null;
}

export default function Modal({ isOpen, onClose, selectedItemId }: ModalProps) {
  const currentLocale = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLocale);

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  if (!isVisible) return null;

  const getModalContent = () => {
    switch (selectedItemId) {
      case "onas":
        return {
          title: dict?.modal.about_us.title || "About Us",
          content: dict?.modal.about_us.content || "Content not available",
        };
      case "chasto":
        return {
          title: dict?.modal.faq.title || "Frequently Asked Questions",
          content: dict?.modal.faq.questions || [],
        };
      case "vip":
        return {
          title: dict?.modal.vip.title || "VIP",
          content: dict?.modal.vip.content || "Content not available",
        };
      case "akcii":
        return {
          title: dict?.modal.promotions.title || "Promotions",
          content: dict?.modal.promotions.content || "Content not available",
        };
      default:
        return { title: "Unknown", content: "Content not available" };
    }
  };

  const { title, content } = getModalContent();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isAnimating ? "bg-black/50" : "bg-black/0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg z-50 w-11/12 max-w-md transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {" "}
          {/* Height limit and scroll */}
          {Array.isArray(content) ? (
            <ul className="space-y-4">
              {content.map((item, index) => (
                <li key={index}>
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-gray-300 whitespace-pre-line text-sm">
                    {item.answer}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300 whitespace-pre-line">{content}</p>
          )}
        </div>
      </div>
    </>
  );
}
