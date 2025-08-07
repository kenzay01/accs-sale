"use client";

import { useMemo, useState } from "react";
import { useItemContext } from "@/context/itemsContext";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Plus, Minus, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import bgImage from "@/public/bgImage.jpg";
import type { CartItem } from "@/types/categories";
import Link from "next/link";
import UsefulLinks from "@/components/UsefulLinks";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";

export default function ShoppingCart() {
  const currentLanguage = useCurrentLanguage();
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(""); // State for Telegram username
  const { dict } = useDictionary(currentLanguage as Locale);
  const { cartItems, addCartItem, removeCartItem, setCartItems } =
    useItemContext();

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, cartItem) => {
      return total + cartItem.price * cartItem.quantity;
    }, 0);
  }, [cartItems]);

  const handleIncrease = (cartItem: CartItem) => {
    addCartItem({
      id: cartItem.id,
      name: cartItem.name,
      price: cartItem.price,
      img: cartItem.img,
      categoryId: cartItem.categoryId,
      subcategoryId: cartItem.subcategoryId,
      timeAdded: cartItem.timeAdded,
      quantity: cartItem.quantity + 1,
    });
  };

  const handleDecrease = (cartItem: CartItem) => {
    if (cartItem.quantity === 1) {
      return;
    } else {
      removeCartItem(cartItem.id);
    }
  };

  const handleRemove = (itemId: string) => {
    removeCartItem(itemId);
  };

  const handleMenuItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Logic to send order to managers' group
    console.log("Order submitted for processing", { telegramUsername });
    setIsCheckoutOpen(false);
    setCartItems([]);
    localStorage.removeItem("cartItems");
    router.push(`/${currentLanguage}/`);
  };

  // Handle Telegram input focus to prepend @
  const handleTelegramFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!telegramUsername.startsWith("@")) {
      setTelegramUsername(`@${telegramUsername}`);
    }
  };

  // Handle Telegram input change to ensure @ is always present
  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure the value always starts with @
    if (!value.startsWith("@")) {
      value = `@${value}`;
    }
    setTelegramUsername(value);
  };

  // Prevent deletion of @ using keyboard
  const handleTelegramKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      telegramUsername === "@"
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="relative min-h-screen text-white">
        <div className="absolute inset-0 -z-1">
          <Image
            src={bgImage}
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
            className=""
          />
        </div>

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">
              {isCheckoutOpen
                ? dict?.shopping_cart?.checkout || "Оформление заказа"
                : dict?.shopping_cart?.title || "Корзина"}
            </h1>
            <button className="px-4 py-2 bg-gray-950 hover:bg-gray-900 rounded-lg transition-colors text-sm">
              {isCheckoutOpen ? (
                <span onClick={() => setIsCheckoutOpen(false)}>
                  {dict?.shopping_cart?.back_to_cart || "Назад в корзину"}
                </span>
              ) : (
                <Link href={`/${currentLanguage}/`}>
                  {dict?.shopping_cart?.continue_shopping ||
                    "Продолжить покупки"}
                </Link>
              )}
            </button>
          </div>

          {!isCheckoutOpen && (
            <div>
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4 text-lg">
                      {dict?.shopping_cart?.empty || "Корзина пуста"}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {dict?.shopping_cart?.empty_subtitle ||
                        "Добавьте товары для оформления заказа"}
                    </div>
                  </div>
                ) : (
                  cartItems.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="relative bg-gray-950 border-2 border-gray-800 hover:border-red-500 transition-all duration-300 rounded-xl p-4 shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        {/* Item Image */}
                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Image
                            src={cartItem.img}
                            alt={cartItem.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-contain w-16 h-16"
                          />
                        </div>

                        {/* Item Info */}
                        <div className="flex flex-col">
                          <div className="">
                            <h3 className="font-semibold text-white">
                              {cartItem.name}
                            </h3>
                            <div className="text-lg font-bold text-red-500">
                              ${cartItem.price}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-900 rounded-lg">
                            <button
                              onClick={() => handleDecrease(cartItem)}
                              className="p-2 hover:bg-gray-700 transition-colors rounded-l-lg"
                            >
                              <Minus className="w-5 h-5 text-white" />
                            </button>
                            <span className="px-4 py-2 text-white font-semibold min-w-[60px] text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrease(cartItem)}
                              className="p-2 hover:bg-gray-700 transition-colors rounded-r-lg"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(cartItem.id)}
                          className="absolute top-2 right-2 p-2 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="bg-gray-950 border-2 border-gray-800 rounded-xl p-6 mb-6">
                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <div className="text-gray-400 text-sm mb-2">
                      {dict?.shopping_cart?.items_in_cart || "В корзине"}{" "}
                      {cartItems.length}{" "}
                      {cartItems.length === 1
                        ? dict?.shopping_cart?.item || "товар"
                        : cartItems.length < 5
                        ? dict?.shopping_cart?.items || "товара"
                        : dict?.shopping_cart?.items_many || "товаров"}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-white">
                      {dict?.shopping_cart?.total || "Итого"}:
                    </span>
                    <span className="text-2xl font-bold text-red-500">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-xl"
                  >
                    <span>
                      {dict?.shopping_cart?.checkout || "К оформлению"}
                    </span>
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Checkout Form */}
          {isCheckoutOpen && (
            <div className="bg-gray-950 border-2 border-gray-800 rounded-xl p-6 mb-6">
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">
                    {dict?.header?.payment || "Оплата"}
                  </label>
                  <select className="w-full p-2 bg-gray-900 rounded-lg">
                    <option>{dict?.header?.usdt || "USDT"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {dict?.header?.your_name || "Ваше имя*"}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 bg-gray-900 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {dict?.header?.telegram_username ||
                      "Ваш username telegram*"}
                  </label>
                  <input
                    type="text"
                    value={telegramUsername}
                    onFocus={handleTelegramFocus}
                    onChange={handleTelegramChange}
                    onKeyDown={handleTelegramKeyDown}
                    className="w-full p-2 bg-gray-900 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center text-[12px]">
                    <input type="checkbox" className="mr-2" required />
                    {dict?.header?.agree_rules ||
                      "Я согласен с правилами работы сервиса"}
                  </label>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-white">
                    {dict?.shopping_cart?.total || "Итого"}:
                  </span>
                  <span className="text-2xl font-bold text-red-500">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-4 rounded-xl transition-colors"
                >
                  {dict?.shopping_cart?.place_order || "Оформить заказ"}
                </button>
              </form>
            </div>
          )}
          <div className="bg-gray-950 border-2 border-gray-800 rounded-xl p-6 mb-6">
            <UsefulLinks
            // noNeededMt={true}
            />
          </div>
        </div>
      </div>
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItemId={selectedItemId}
      /> */}
    </>
  );
}
