"use client";

import { useMemo, useState, useEffect } from "react";
import type { MainItemProps } from "@/types/mainItem";
import { useItemContext } from "@/context/itemsContext";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Plus, Minus } from "lucide-react";

export default function MainItem({
  id,
  name,
  price,
  img,
  categoryId,
  subcategoryId,
  timeAdded,
}: MainItemProps) {
  const currentLanguage = useCurrentLanguage();
  const { dict } = useDictionary(currentLanguage as Locale);
  const { addCartItem, removeCartItem, cartItems } = useItemContext();
  const { categories, subcategories } = useItemContext();

  // Sync inCart and quantity with cart context
  const cartItem = useMemo(
    () => cartItems?.find((item) => item.id === id),
    [cartItems, id]
  );
  const [inCart, setInCart] = useState(!!cartItem);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);

  useEffect(() => {
    setInCart(!!cartItem);
    setQuantity(cartItem?.quantity || 1);
  }, [cartItem]);

  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.id === categoryId);
  }, [categories, categoryId]);

  const currentSubcategory = useMemo(() => {
    return subcategories[categoryId]?.find((sub) => sub.id === subcategoryId);
  }, [subcategories, categoryId, subcategoryId]);

  const currentCategoryLabel = useMemo(() => {
    return currentLanguage === "ru"
      ? currentCategory?.label_ru
      : currentCategory?.label_en;
  }, [currentCategory, currentLanguage]);

  const currentSubcategoryLabel = useMemo(() => {
    return currentLanguage === "ru"
      ? currentSubcategory?.label_ru
      : currentSubcategory?.label_en;
  }, [currentSubcategory, currentLanguage]);

  const handleItemClick = () => {
    console.log("Item clicked:", id);
    // Add logic here for item click (e.g., show details)
  };

  const handleCartAction = () => {
    if (!inCart) {
      addCartItem({
        id,
        name,
        price,
        img,
        categoryId,
        subcategoryId,
        timeAdded,
        quantity: 1,
      });
      setInCart(true);
    } else if (quantity === 1) {
      removeCartItem(id);
      setInCart(false);
    } else {
      const newQuantity = quantity - 1;
      addCartItem({
        id,
        name,
        price,
        img,
        categoryId,
        subcategoryId,
        timeAdded,
        quantity: newQuantity,
      });
      setQuantity(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    addCartItem({
      id,
      name,
      price,
      img,
      categoryId,
      subcategoryId,
      timeAdded,
      quantity: newQuantity,
    });
    setQuantity(newQuantity);
  };

  return (
    <div
      className="flex flex-col items-center bg-gray-900 rounded-xl p-4 min-w-38 w-40 shadow-xl hover:shadow-2xl transition-shadow"
      onClick={handleItemClick}
    >
      <div className="w-24 h-24 bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
        <span className="text-white font-bold">{img}</span>
      </div>
      <div className="text-sm text-gray-400 mb-1">{name}</div>
      <div className="text-lg font-semibold mb-1">${price}</div>
      <div className="text-sm text-gray-400 mb-1 rounded-xl shadow-2xl">
        {currentCategoryLabel}
      </div>
      <div className="text-sm text-gray-400 mb-4 rounded-xl shadow-2xl">
        {currentSubcategoryLabel}
      </div>
      {inCart ? (
        <div className="w-full h-10 bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-evenly">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering item click
              handleCartAction();
            }}
            className="text-2xl flex items-center justify-center"
          >
            <Minus className="w-6 h-6" />
          </button>
          <span className="text-white">{quantity}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering item click
              handleIncrease();
            }}
            className="flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering item click
            handleCartAction();
          }}
          className="w-full h-10 bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          {dict?.main_item.in_cart || "Add to Cart"}
        </button>
      )}
    </div>
  );
}
