"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { CartItem, Category, Subcategory } from "@/types/categories";
import type { MainItemProps } from "@/types/mainItem";

interface ItemContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  subcategories: { [key: string]: Subcategory[] };
  setSubcategories: (subcategories: { [key: string]: Subcategory[] }) => void;
  items: MainItemProps[];
  setItems: (items: MainItemProps[]) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  editCategory: (id: string, updatedCategory: Category) => void;
  addSubcategory: (categoryId: string, subcategory: Subcategory) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  editSubcategory: (
    categoryId: string,
    subcategoryId: string,
    updatedSubcategory: Subcategory
  ) => void;
  addItem: (item: MainItemProps) => void;
  deleteItem: (id: string) => void;
  editItem: (id: string, updatedItem: MainItemProps) => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  addCartItem: (item: CartItem) => void;
  removeCartItem: (id: string) => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "cat1",
      label_ru: "Категория 1",
      label_en: "Category 1",
      img: "/cat1.jpg",
    },
    {
      id: "cat2",
      label_ru: "Категория 2",
      label_en: "Category 2",
      img: "/cat2.jpg",
    },
  ]);
  const [subcategories, setSubcategories] = useState<{
    [key: string]: Subcategory[];
  }>({
    cat1: [
      {
        id: "sub1",
        label_ru: "Подкатегория 1.1",
        label_en: "Subcategory 1.1",
        img: "/sub1.jpg",
      },
      {
        id: "sub2",
        label_ru: "Подкатегория 1.2",
        label_en: "Subcategory 1.2",
        img: "/sub2.jpg",
      },
      {
        id: "sub3",
        label_ru: "Подкатегория 1.3",
        label_en: "Subcategory 1.3",
        img: "/sub3.jpg",
      },
      {
        id: "sub4",
        label_ru: "Подкатегория 1.4",
        label_en: "Subcategory 1.4",
        img: "/sub4.jpg",
      },
      {
        id: "sub5",
        label_ru: "Подкатегория 1.5",
        label_en: "Subcategory 1.5",
        img: "/sub5.jpg",
      },
    ],
    cat2: [
      {
        id: "sub3",
        label_ru: "Подкатегория 2.1",
        label_en: "Subcategory 2.1",
        img: "/sub3.jpg",
      },
      {
        id: "sub4",
        label_ru: "Подкатегория 2.2",
        label_en: "Subcategory 2.2",
        img: "/sub4.jpg",
      },
    ],
  });
  const [items, setItems] = useState<MainItemProps[]>([
    {
      id: "item1",
      name: "talkSPORT BET",
      price: 220,
      img: "/item1.jpg",
      categoryId: "cat1",
      subcategoryId: "sub1",
      timeAdded: "2023-01-01T00:00:00Z",
    },
    {
      id: "item2",
      name: "sky bet",
      price: 200,
      img: "/item2.jpg",
      categoryId: "cat1",
      subcategoryId: "sub2",
      timeAdded: "2023-01-02T00:00:00Z",
    },
    {
      id: "item3",
      name: "test",
      price: 500,
      img: "/item3.jpg",
      categoryId: "cat2",
      subcategoryId: "sub2",
      timeAdded: "2023-01-03T00:00:00Z",
    },
  ]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addCartItem = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };
  const removeCartItem = (id: string) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setSubcategories((prev) => {
      const newSubcats = { ...prev };
      delete newSubcats[id];
      return newSubcats;
    });
  };

  const editCategory = (id: string, updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updatedCategory : cat))
    );
  };

  const addSubcategory = (categoryId: string, subcategory: Subcategory) => {
    setSubcategories((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), subcategory],
    }));
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setSubcategories((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((sub) => sub.id !== subcategoryId),
    }));
  };

  const editSubcategory = (
    categoryId: string,
    subcategoryId: string,
    updatedSubcategory: Subcategory
  ) => {
    setSubcategories((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].map((sub) =>
        sub.id === subcategoryId ? updatedSubcategory : sub
      ),
    }));
  };

  const addItem = (item: MainItemProps) => {
    setItems((prev) => [...prev, item]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const editItem = (id: string, updatedItem: MainItemProps) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  return (
    <ItemContext.Provider
      value={{
        categories,
        setCategories,
        subcategories,
        setSubcategories,
        items,
        setItems,
        addCategory,
        deleteCategory,
        editCategory,
        addSubcategory,
        deleteSubcategory,
        editSubcategory,
        addItem,
        deleteItem,
        editItem,
        cartItems,
        setCartItems,
        addCartItem,
        removeCartItem,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItemContext must be used within an ItemProvider");
  }
  return context;
};
