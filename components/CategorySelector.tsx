"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import type { Category, Subcategory } from "@/types/categories";
import CategoryItem from "./CategoryItem";
import { FaArrowLeft } from "react-icons/fa6";

interface CategorySelectorProps {
  onSelectionChange: (
    categoryId: string | null,
    subcategoryId: string | null
  ) => void;
  categories: Category[];
  subcategories: { [key: string]: Subcategory[] };
}

export default function CategorySelector({
  onSelectionChange,
  categories,
  subcategories,
}: CategorySelectorProps) {
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    const category = categories.find((c) => c.id === selectedCategory);
    return currentLanguage === "ru" ? category?.label_ru : category?.label_en;
  }, [currentLanguage, selectedCategory, categories]);

  const selectedSubcategoryLabel = useMemo(() => {
    if (!selectedCategory || !selectedSubcategory) return null;
    const subcat = subcategories[selectedCategory]?.find(
      (s) => s.id === selectedSubcategory
    );
    return currentLanguage === "ru" ? subcat?.label_ru : subcat?.label_en;
  }, [currentLanguage, selectedCategory, selectedSubcategory, subcategories]);

  useEffect(() => {
    onSelectionChange(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory, onSelectionChange]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <div className="p-4">
      {!selectedCategory && (
        <h2 className="text-lg font-semibold mb-2">{dict?.main || "Main"}</h2>
      )}
      {selectedCategory && !selectedSubcategory && (
        <div className="flex items-center mb-2 gap-2">
          <FaArrowLeft
            className="w-6 h-auto cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          />
          <h2 className="font-semibold">{selectedCategoryLabel}</h2>
        </div>
      )}
      {selectedCategory && selectedSubcategory && (
        <div className="flex items-center mb-2 gap-2">
          <FaArrowLeft
            className="w-6 h-auto cursor-pointer"
            onClick={() => setSelectedSubcategory(null)}
          />
          <h2
            className="font-semibold hover:underline cursor-pointer"
            onClick={() => setSelectedSubcategory(null)}
          >
            {selectedCategoryLabel}
          </h2>
          <div className="w-4 border-b-4 border-gray-300 mx-1 rounded-full"></div>
          <h2 className="font-semibold">{selectedSubcategoryLabel}</h2>
        </div>
      )}
      {!selectedCategory ? (
        categories.length > 0 ? (
          <div className="flex gap-3 flex-nowrap overflow-x-auto py-4 pb-6 px-2">
            {categories.map((category) => {
              const label =
                currentLanguage === "ru"
                  ? category.label_ru
                  : category.label_en;
              return (
                <CategoryItem
                  key={category.id}
                  id={category.id}
                  label={label}
                  onClick={handleCategorySelect}
                  imageSrc={category.img}
                  imageAlt={category.label_en}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-300">
            {dict?.home.no_categories || "No categories available"}
          </p>
        )
      ) : subcategories[selectedCategory]?.length > 0 ? (
        <div className="flex gap-3 flex-nowrap overflow-x-auto py-4 pb-6 px-2">
          {subcategories[selectedCategory].map((subcategory) => {
            const label =
              currentLanguage === "ru"
                ? subcategory.label_ru
                : subcategory.label_en;
            return (
              <CategoryItem
                key={subcategory.id}
                id={subcategory.id}
                label={label}
                onClick={handleSubcategorySelect}
                imageSrc={subcategory.img}
                imageAlt={subcategory.label_en}
                active={selectedSubcategory === subcategory.id}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-300">
          {dict?.home.no_subcategories || "No subcategories available"}
        </p>
      )}
    </div>
  );
}
