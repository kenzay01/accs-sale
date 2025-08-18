"use client";

import { useMemo, useState, useEffect } from "react";
import { useItemContext } from "@/context/itemsContext";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Plus, Minus, X, ShoppingCart } from "lucide-react";
import UsefulLinks from "./UsefulLinks";
import Image from "next/image";

interface ModalItemProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  handleMenuItemClick: (itemId: string) => void;
}

export default function ModalItem({
  isOpen,
  onClose,
  itemId,
  handleMenuItemClick,
}: ModalItemProps) {
  const currentLanguage = useCurrentLanguage();
  const { dict } = useDictionary(currentLanguage as Locale);
  const {
    items,
    addCartItem,
    removeCartItem,
    cartItems,
    categories,
    subcategories,
  } = useItemContext();

  const item = useMemo(() => {
    return items.find((item) => item.id === itemId);
  }, [items, itemId]);

  const cartItem = useMemo(
    () => cartItems?.find((cartItem) => cartItem.id === itemId),
    [cartItems, itemId]
  );

  const [inCart, setInCart] = useState(!!cartItem);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);

  useEffect(() => {
    setInCart(!!cartItem);
    setQuantity(cartItem?.quantity || 1);
  }, [cartItem]);

  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.id === item?.categoryId);
  }, [categories, item?.categoryId]);

  const currentSubcategory = useMemo(() => {
    return subcategories[item?.categoryId || ""]?.find(
      (sub) => sub.id === item?.subcategoryId
    );
  }, [subcategories, item?.categoryId, item?.subcategoryId]);

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

  const handleCartAction = () => {
    if (!item) return;

    if (!inCart) {
      addCartItem({
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId,
        timeAdded: item.timeAdded,
        quantity: 1,
      });
      setInCart(true);
    } else if (quantity === 1) {
      removeCartItem(item.id);
      setInCart(false);
    } else {
      const newQuantity = quantity - 1;
      removeCartItem(item.id);
      setQuantity(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (!item) return;

    const newQuantity = quantity + 1;
    addCartItem({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      timeAdded: item.timeAdded,
      quantity: newQuantity,
    });
    setQuantity(newQuantity);
  };

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

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center ">
      <div className="bg-gray-950 w-full h-full overflow-y-auto relative rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-900 hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        {/* Item Image */}
        <div className="relative w-full h-64 bg-gray-900">
          <Image
            src={item.img}
            alt={item.name}
            fill
            className="object-contain rounded-t-2xl"
          />
        </div>
        {/* Content */}
        <div className="p-6">
          {/* Category and Subcategory */}
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full">
              {currentCategoryLabel}
            </span>
            <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full">
              {currentSubcategoryLabel}
            </span>
          </div>

          {/* Item Name */}
          <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>

          {/* Price */}
          <div className="text-3xl font-bold text-red-500 mb-4">
            ${item.price}
          </div>

          {/* Description */}
          <div className="text-gray-300 mb-6">
            <h3 className="font-semibold mb-2">
              {dict?.modal_item.description || "Description"}
            </h3>
            <p className="text-sm leading-relaxed">
              {currentLanguage === "ru"
                ? item.description_ru
                : item.description_en || "No description available."}
            </p>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">
                {dict?.modal_item.date_added || "Date Added"}
              </div>
              <div className="text-white text-sm">
                {new Date(item.timeAdded).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Cart Actions */}
          <div className="space-y-3">
            {inCart ? (
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-800 rounded-lg">
                  <button
                    onClick={handleCartAction}
                    className="p-3 hover:bg-gray-700 transition-colors rounded-l-lg"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="px-4 py-3 text-white font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="p-3 hover:bg-gray-700 transition-colors rounded-r-lg"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Total Price */}
                <div className="flex-1 text-right">
                  <div className="text-gray-400 text-sm">
                    {dict?.modal_item.total || "Total"}
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${(item.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCartAction}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                {dict?.main_item.in_cart || "Add to Cart"}
              </button>
            )}
          </div>
          <UsefulLinks />
        </div>
        <div></div>
        {cartItems.length > 0 && <div className="h-16" />}
      </div>
    </div>
  );
}
