"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { CartItem, Category, Subcategory, Page } from "@/types/categories";
import type { MainItemProps } from "@/types/mainItem";

interface ItemContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  subcategories: { [key: string]: Subcategory[] };
  setSubcategories: (subcategories: { [key: string]: Subcategory[] }) => void;
  items: MainItemProps[];
  setItems: (items: MainItemProps[]) => void;
  pages: Page[];
  setPages: (pages: Page[]) => void;
  addCategory: (formData: FormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  editCategory: (id: string, formData: FormData) => Promise<void>;
  addSubcategory: (categoryId: string, formData: FormData) => Promise<void>;
  deleteSubcategory: (
    categoryId: string,
    subcategoryId: string
  ) => Promise<void>;
  editSubcategory: (
    categoryId: string,
    subcategoryId: string,
    formData: FormData
  ) => Promise<void>;
  addItem: (formData: FormData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  editItem: (id: string, formData: FormData) => Promise<void>;
  addPage: (formData: FormData) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  editPage: (id: string, formData: FormData) => Promise<void>;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  addCartItem: (item: CartItem) => void;
  removeCartItem: (id: string) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{
    [key: string]: Subcategory[];
  }>({});
  const [items, setItems] = useState<MainItemProps[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load cartItems from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cartItems");
      try {
        console.log("Loaded from localStorage:", savedCart);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (e) {
        console.error("Error parsing cartItems from localStorage:", e);
        setCartItems([]);
      }
    }
  }, []);

  // Save cartItems to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Saving to localStorage:", cartItems);
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Fetch categories, subcategories, items, and pages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        if (!categoriesRes.ok) {
          const errorData = await categoriesRes.json();
          throw new Error(errorData.error || "Failed to fetch categories");
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // Fetch subcategories
        const subcategoriesData: { [key: string]: Subcategory[] } = {};
        for (const category of categoriesData) {
          const subRes = await fetch(
            `/api/subcategories?categoryId=${category.id}`
          );
          if (!subRes.ok) {
            const errorData = await subRes.json();
            throw new Error(
              errorData.error ||
                `Failed to fetch subcategories for category ${category.id}`
            );
          }
          const subData = await subRes.json();
          subcategoriesData[category.id] = subData.map((sub: any) => ({
            id: sub.id,
            categoryId: sub.category_id,
            label_ru: sub.label_ru,
            label_en: sub.label_en,
            img: sub.img,
          }));
        }
        setSubcategories(subcategoriesData);

        // Fetch items
        const itemsRes = await fetch("/api/items");
        if (!itemsRes.ok) {
          const errorData = await itemsRes.json();
          throw new Error(errorData.error || "Failed to fetch items");
        }
        const itemsData = await itemsRes.json();
        setItems(
          itemsData.map((item: any) => ({
            id: item.id,
            categoryId: item.category_id,
            subcategoryId: item.subcategory_id,
            name: item.name,
            price: parseFloat(item.price) || 0,
            description_ru: item.description_ru || "",
            description_en: item.description_en || "",
            img: item.img,
            timeAdded: item.time_added || new Date().toISOString(),
          }))
        );

        // Fetch pages
        const pagesRes = await fetch("/api/pages");
        if (!pagesRes.ok) {
          const errorData = await pagesRes.json();
          throw new Error(errorData.error || "Failed to fetch pages");
        }
        const pagesData = await pagesRes.json();
        setPages(
          pagesData.map((page: any) => ({
            id: page.id,
            title_ru: page.title_ru,
            title_en: page.title_en,
            content_ru: page.content_ru,
            content_en: page.content_en,
            content_type: page.content_type,
          }))
        );
      } catch (error: any) {
        setError(error.message || "Failed to load data");
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addCartItem = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      return existingItem
        ? prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === id);
      return existingItem && existingItem.quantity > 1
        ? prev.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
          )
        : prev.filter((i) => i.id !== id);
    });
  };

  const addCategory = async (formData: FormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add category");
      }
      const newCategory = await response.json();
      setCategories((prev) => [...prev, newCategory]);
    } catch (error: any) {
      console.error("Failed to add category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setSubcategories((prev) => {
        const newSubcats = { ...prev };
        delete newSubcats[id];
        return newSubcats;
      });
      setItems((prev) => prev.filter((item) => item.categoryId !== id));
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  };

  const editCategory = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/categories`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit category");
      }
      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
    } catch (error: any) {
      console.error("Failed to edit category:", error);
      throw error;
    }
  };

  const addSubcategory = async (categoryId: string, formData: FormData) => {
    try {
      const response = await fetch("/api/subcategories", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add subcategory");
      }
      const newSubcategory = await response.json();
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: [
          ...(prev[categoryId] || []),
          {
            id: newSubcategory.id,
            categoryId: newSubcategory.category_id,
            label_ru: newSubcategory.label_ru,
            label_en: newSubcategory.label_en,
            img: newSubcategory.img,
          },
        ],
      }));
    } catch (error: any) {
      console.error("Failed to add subcategory:", error);
      throw error;
    }
  };

  const deleteSubcategory = async (
    categoryId: string,
    subcategoryId: string
  ) => {
    try {
      const response = await fetch(`/api/subcategories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subcategoryId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete subcategory");
      }
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(
          (sub) => sub.id !== subcategoryId
        ),
      }));
      setItems((prev) =>
        prev.filter((item) => item.subcategoryId !== subcategoryId)
      );
    } catch (error: any) {
      console.error("Failed to delete subcategory:", error);
      throw error;
    }
  };

  const editSubcategory = async (
    categoryId: string,
    subcategoryId: string,
    formData: FormData
  ) => {
    try {
      const response = await fetch(`/api/subcategories`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit subcategory");
      }
      const updatedSubcategory = await response.json();
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId].map((sub) =>
          sub.id === subcategoryId
            ? {
                id: updatedSubcategory.id,
                categoryId: updatedSubcategory.category_id,
                label_ru: updatedSubcategory.label_ru,
                label_en: updatedSubcategory.label_en,
                img: updatedSubcategory.img,
              }
            : sub
        ),
      }));
    } catch (error: any) {
      console.error("Failed to edit subcategory:", error);
      throw error;
    }
  };

  const addItem = async (formData: FormData) => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item");
      }
      const newItem = await response.json();
      setItems((prev) => [
        ...prev,
        {
          id: newItem.id,
          categoryId: newItem.category_id,
          subcategoryId: newItem.subcategory_id,
          name: newItem.name,
          price: parseFloat(newItem.price) || 0,
          description_ru: newItem.description_ru || "",
          description_en: newItem.description_en || "",
          img: newItem.img,
          timeAdded: newItem.time_added || new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to add item:", error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  };

  const editItem = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/items`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit item");
      }
      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                id: updatedItem.id,
                categoryId: updatedItem.category_id,
                subcategoryId: updatedItem.subcategory_id,
                name: updatedItem.name,
                price: parseFloat(updatedItem.price) || 0,
                description_ru: updatedItem.description_ru || "",
                description_en: updatedItem.description_en || "",
                img: updatedItem.img,
                timeAdded: updatedItem.time_added || item.timeAdded,
              }
            : item
        )
      );
    } catch (error: any) {
      console.error("Failed to edit item:", error);
      throw error;
    }
  };

  const addPage = async (formData: FormData) => {
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add page");
      }
      const newPage = await response.json();
      setPages((prev) => [...prev, newPage]);
    } catch (error: any) {
      console.error("Failed to add page:", error);
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      const response = await fetch(`/api/pages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete page");
      }
      setPages((prev) => prev.filter((page) => page.id !== id));
    } catch (error: any) {
      console.error("Failed to delete page:", error);
      throw error;
    }
  };

  const editPage = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/pages`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit page");
      }
      const updatedPage = await response.json();
      setPages((prev) =>
        prev.map((page) => (page.id === id ? updatedPage : page))
      );
    } catch (error: any) {
      console.error("Failed to edit page:", error);
      throw error;
    }
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
        pages,
        setPages,
        addCategory,
        deleteCategory,
        editCategory,
        addSubcategory,
        deleteSubcategory,
        editSubcategory,
        addItem,
        deleteItem,
        editItem,
        addPage,
        deletePage,
        editPage,
        cartItems,
        setCartItems,
        addCartItem,
        removeCartItem,
        userId,
        setUserId,
        loading,
        error,
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
