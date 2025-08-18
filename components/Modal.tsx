import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FAQ } from "@/types/categories";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | FAQ[];
  contentType: "text" | "faq";
}

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(t\.me\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  contentType,
}: ModalProps) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80]">
      <div className="bg-gray-950 rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        {contentType === "text" ? (
          <p className="text-gray-300 whitespace-pre-line">
            {renderTextWithLinks(content as string)}
          </p>
        ) : (
          <div className="space-y-6">
            {(content as FAQ[]).map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold text-white">{faq.question}</h3>
                <p className="text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render the modal content into the document body using a portal
  return createPortal(modalContent, document.body);
};

export default Modal;
