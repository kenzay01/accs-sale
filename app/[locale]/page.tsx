"use client";

import Header from "@/components/Header";
import FilterModal from "@/components/FilterModal";
import MenuSidebar from "@/components/MenuSidebar";
import Modal from "@/components/Modal";
import CategorySelector from "@/components/CategorySelector";
import MainItem from "@/components/MainItem";
import { useState, useEffect, useMemo } from "react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Filter, Menu, Search } from "lucide-react";
import Image from "next/image";
import bgImage from "@/public/bgImage.jpg";
import CartButton from "@/components/CartButton";
import type { Category, Subcategory } from "@/types/categories";
import { ItemProvider, useItemContext } from "@/context/itemsContext";
import { v4 as uuidv4 } from "uuid";

function HomeContent() {
  const { categories, subcategories, items } = useItemContext();
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("rates");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const { cartItems } = useItemContext();

  const filterOptions = dict?.home.filter_options || [
    { id: "rates", label: "By rates" },
    { id: "novinki", label: "New items" },
    { id: "vozvrastanie", label: "By price ascending" },
    { id: "ubivanie", label: "By price descending" },
  ];

  // Фільтрація і сортування items
  const filteredAndSortedItems = useMemo(() => {
    let filteredItems = [...items];

    // Фільтрація за пошуковим запитом
    if (searchQuery.trim()) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фільтрація за категорією
    if (selectedCategory) {
      filteredItems = filteredItems.filter(
        (item) => item.categoryId === selectedCategory
      );
    }

    // Фільтрація за підкатегорією
    if (selectedSubcategory) {
      filteredItems = filteredItems.filter(
        (item) => item.subcategoryId === selectedSubcategory
      );
    }

    // Сортування за обраним фільтром
    switch (selectedFilter) {
      case "novinki":
        // Сортування за датою додавання (найновіші спочатку)
        filteredItems.sort(
          (a, b) =>
            new Date(b.timeAdded).getTime() - new Date(a.timeAdded).getTime()
        );
        break;
      case "vozvrastanie":
        // Сортування за ціною (від меншої до більшої)
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case "ubivanie":
        // Сортування за ціною (від більшої до меншої)
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case "rates":
      default:
        // За замовчуванням залишаємо оригінальний порядок (або можна додати логіку для рейтингів)
        break;
    }

    return filteredItems;
  }, [
    items,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedFilter,
  ]);

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setIsFilterOpen(false);
    console.log("Selected filter:", filterId);
  };

  const handleMenuItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleSelectionChange = (
    categoryId: string | null,
    subcategoryId: string | null
  ) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    // if (subcategoryId) {
    //   console.log(
    //     "Applied filter - Category:",
    //     categoryId,
    //     "Subcategory:",
    //     subcategoryId
    //   );
    // }
  };

  return (
    <div className="relative min-h-screen text-white">
      <CartButton />
      <div className="absolute inset-0 -z-1">
        <Image
          src={bgImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          className=""
        />
      </div>
      <Header />
      <div className="p-4 pt-0 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              dict?.home.search_placeholder || "What am I looking for..."
            }
            className="w-full pl-11 p-2 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Filter className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <CategorySelector
        onSelectionChange={handleSelectionChange}
        categories={categories}
        subcategories={subcategories}
      />
      {selectedFilter && (
        <div className="px-4 pb-2">
          <span className="text-sm text-gray-400">
            {dict?.home.active_filter || "Active filter"}:{" "}
            {filterOptions.find((f) => f.id === selectedFilter)?.label}
          </span>
        </div>
      )}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterSelect={handleFilterSelect}
        dict={dict?.home}
      />
      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMenuItemClick={handleMenuItemClick}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItemId={selectedItemId}
      />
      <section className="p-4">
        <div className="flex gap-4 flex-wrap overflow-x-auto pb-2 items-center">
          {filteredAndSortedItems.map((item) => (
            <MainItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              img={item.img}
              categoryId={item.categoryId}
              subcategoryId={item.subcategoryId}
              timeAdded={item.timeAdded}
            />
          ))}
        </div>
      </section>
      {/* <div>
        <p className="text-gray-300">Test: {searchQuery}</p>
        <p className="text-gray-300">
          Category:{" "}
          {selectedCategory
            ? currentLanguage === "ru"
              ? categories.find((c) => c.id === selectedCategory)?.label_ru
              : categories.find((c) => c.id === selectedCategory)?.label_en
            : "None"}
          , Subcategory:{" "}
          {selectedSubcategory
            ? currentLanguage === "ru"
              ? subcategories[selectedCategory || ""].find(
                  (s) => s.id === selectedSubcategory
                )?.label_ru
              : subcategories[selectedCategory || ""].find(
                  (s) => s.id === selectedSubcategory
                )?.label_en
            : "None"}
        </p>
        <p>
          cartItems: {cartItems?.length}: {JSON.stringify(cartItems)}
        </p>
      </div> */}
      {cartItems.length > 0 && <div className="h-12" />}
    </div>
  );
}

export default function Home() {
  return (
    <ItemProvider>
      {/* <ManageSection /> */}
      <HomeContent />
    </ItemProvider>
  );
}
