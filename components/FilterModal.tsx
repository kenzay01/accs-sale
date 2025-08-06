import { useState, useEffect } from "react";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOption[];
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
  dict?: {
    filter_title?: string;
  };
}

export default function FilterModal({
  isOpen,
  onClose,
  filterOptions,
  selectedFilter,
  onFilterSelect,
  dict,
}: FilterModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Задержка для запуска анимации после рендера
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

  const handleFilterSelect = (filterId: string) => {
    onFilterSelect(filterId);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 transition-all duration-300 flex items-start justify-center z-[70] ${
        isAnimating ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-gray-950 border-2 border-t-0 border-red-500 p-6 rounded-b-lg shadow-lg w-11/12 max-w-md transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-white">
          {dict?.filter_title || "Sort by"}
        </h2>

        <div className="space-y-3">
          {filterOptions.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                id={option.id}
                name="filter"
                checked={selectedFilter === option.id}
                onChange={() => handleFilterSelect(option.id)}
                className="mr-3 text-red-600 focus:ring-red-500"
              />
              <label
                htmlFor={option.id}
                className="text-white cursor-pointer flex-1"
                onClick={() => handleFilterSelect(option.id)}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
