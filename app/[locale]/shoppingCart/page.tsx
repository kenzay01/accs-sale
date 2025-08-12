"use client";

import { useMemo, useState } from "react";
import { useItemContext } from "@/context/itemsContext";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Plus, Minus, X, ChevronRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import bgImage from "@/public/bgImage.jpg";
import type { CartItem } from "@/types/categories";
import Link from "next/link";
import UsefulLinks from "@/components/UsefulLinks";
import { useRouter } from "next/navigation";

export default function ShoppingCart() {
  const currentLanguage = useCurrentLanguage();
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [customerName, setCustomerName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("USDT");
  const [agreeToRules, setAgreeToRules] = useState(false);

  const { dict } = useDictionary(currentLanguage as Locale);
  const { cartItems, addCartItem, removeCartItem, setCartItems, userId } =
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

  const handleCheckout = () => {
    if (!userId) {
      alert(
        "Помилка: не знайдено ID користувача. Будь ласка, перейдіть до каталогу через Telegram бот."
      );
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId) {
      alert("Помилка: не знайдено ID користувача");
      return;
    }

    if (!agreeToRules) {
      alert(
        dict?.shopping_cart?.agree_rules_error ||
          "Пожалуйста, согласитесь с правилами"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Крок 1: Створюємо замовлення
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          customerName,
          telegramUsername,
          cartItems,
          totalPrice,
          paymentMethod,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderResult = await orderResponse.json();
      console.log("Order created successfully:", orderResult);

      // Крок 2: Формуємо повідомлення для Telegram
      let telegramMessage = `🛒 *Нове замовлення*\n\n`;
      telegramMessage += `👤 *Клієнт:* ${customerName.replace(
        /([_*[\]()~`#+-=|{}.!])/g,
        "\\$1"
      )}\n`;
      telegramMessage += `📱 *Telegram:* ${telegramUsername.replace(
        /([_*[\]()~`#+-=|{}.!])/g,
        "\\$1"
      )}\n`;
      telegramMessage += `💳 *Спосіб оплати:* ${paymentMethod.replace(
        /([_*[\]()~`#+-=|{}.!])/g,
        "\\$1"
      )}\n`;
      telegramMessage += `🆔 *ID користувача:* ${userId}\n\n`;
      telegramMessage += `📦 *Товари:*\n`;

      cartItems.forEach((item, index) => {
        telegramMessage += `${index + 1}\\. ${item.name.replace(
          /([_*[\]()~`#+-=|{}.!])/g,
          "\\$1"
        )}\n`;
        telegramMessage += `   • Кількість: ${item.quantity}\n`;
        telegramMessage += `   • Ціна за одиницю: ${item.price
          .toFixed(2)
          .replace(".", "\\.")}\n`;
        telegramMessage += `   • Сума: ${(item.price * item.quantity)
          .toFixed(2)
          .replace(".", "\\.")}\n\n`;
      });

      telegramMessage += `💰 *Загальна сума:* ${totalPrice
        .toFixed(2)
        .replace(".", "\\.")}\n\n`;
      telegramMessage += `📅 *Дата замовлення:* ${new Date()
        .toLocaleString("uk-UA")
        .replace(/([_*[\]()~`#+-=|{}.!])/g, "\\$1")}\n`;

      // Крок 3: Надсилаємо повідомлення в Telegram
      const telegramResponse = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: telegramMessage,
        }),
      });

      if (!telegramResponse.ok) {
        console.error("Failed to send Telegram message");
        // Не кидаємо помилку, лише логуємо, оскільки замовлення вже створено
      }

      // Крок 4: Очищаємо кошик і показуємо повідомлення про успіх
      setCartItems([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("cartItems");
      }

      setIsOrderPlaced(true);
      setIsCheckoutOpen(false);

      // Перенаправлення через 3 секунди
      setTimeout(() => {
        router.push(`/${currentLanguage}/`);
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Помилка при створенні замовлення. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
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

  // Success screen
  if (isOrderPlaced) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="absolute inset-0 -z-1">
          <Image
            src={bgImage}
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="relative z-10 text-center p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">
            {dict?.shopping_cart?.order_success || "Заказ успешно оформлен!"}
          </h1>
          <p className="text-gray-300 mb-6">
            {dict?.shopping_cart?.order_success_text ||
              "Наш менеджер свяжется с вами в ближайшее время"}
          </p>
          <p className="text-sm text-gray-400">
            {dict?.shopping_cart?.redirect_text ||
              "Вы будете перенаправлены на главную страницу через несколько секунд..."}
          </p>
        </div>
      </div>
    );
  }

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

          {/* User ID display (for debugging) */}
          {userId && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4 text-sm">
              <span className="text-gray-400">User ID: </span>
              <span className="text-white">{userId}</span>
            </div>
          )}

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
                    disabled={!userId}
                    className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-xl ${
                      userId
                        ? "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>
                      {dict?.shopping_cart?.checkout || "К оформлению"}
                    </span>
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {!userId && (
                    <p className="text-red-400 text-sm mt-2 text-center">
                      {dict?.shopping_cart?.no_user_id ||
                        "Для оформлення замовлення потрібно перейти через Telegram бот"}
                    </p>
                  )}
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
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-gray-900 rounded-lg text-white"
                  >
                    <option value="USDT">{dict?.header?.usdt || "USDT"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {dict?.header?.your_name || "Ваше имя*"}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-gray-900 rounded-lg text-white"
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
                    className="w-full p-2 bg-gray-900 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center text-[12px]">
                    <input
                      type="checkbox"
                      checked={agreeToRules}
                      onChange={(e) => setAgreeToRules(e.target.checked)}
                      className="mr-2"
                      required
                    />
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
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl transition-colors font-semibold ${
                    isSubmitting
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
                  }`}
                >
                  {isSubmitting
                    ? dict?.shopping_cart?.placing_order ||
                      "Оформление заказа..."
                    : dict?.shopping_cart?.place_order || "Оформить заказ"}
                </button>
              </form>
            </div>
          )}

          <div className="bg-gray-950 border-2 border-gray-800 rounded-xl p-6 mb-6">
            <UsefulLinks />
          </div>
        </div>
      </div>
    </>
  );
}
