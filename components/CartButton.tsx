"use client";
import { useItemContext } from "@/context/itemsContext";
import { useDictionary } from "@/hooks/getDictionary";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { Locale } from "@/i18n/config";
import Link from "next/link";

export default function CartButton() {
  const { cartItems } = useItemContext();
  const currentLocale = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLocale);
  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return cartItems.length > 0 ? (
    <section className="fixed bottom-0 w-full p-2 bg-gray-900">
      <button className="bg-purple-700 text-white w-full rounded h-8">
        <Link
          href="/shoppingCart"
          className="w-auto h-auto flex items-center justify-center"
        >
          {dict?.cart_btn.cart || "Cart"} ({cartQuantity})
        </Link>
      </button>
    </section>
  ) : null;
}
