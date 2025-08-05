"use client";

import Header from "@/components/Header";
import FilterModal from "@/components/FilterModal";
import MenuSidebar from "@/components/MenuSidebar";
import { useState } from "react";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { Filter, Menu, Search } from "lucide-react";
import Image from "next/image";
import bgImage from "@/public/bgImage.jpg"; // Adjust the path as necessary

export default function Home() {
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("rates");

  // Filter options from dictionary
  const filterOptions = dict?.home.filter_options || [
    { id: "rates", label: "By rates" },
    { id: "novinki", label: "New items" },
    { id: "vozvrastanie", label: "By price ascending" },
    { id: "ubivanie", label: "By price descending" },
  ];

  // Menu items from dictionary
  const menuItems = dict?.home.menu_items || [
    { id: "ponesnie", label: "Featured links" },
    { id: "onas", label: "About us" },
    { id: "chasto", label: "Frequently asked questions" },
    { id: "vip", label: "VIP" },
    { id: "akcii", label: "Promotions" },
    // { id: "uk", label: "United Kingdom" },
  ];

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    // Здесь можно добавить логику применения фильтра
    console.log("Selected filter:", filterId);
  };

  const handleMenuItemClick = (itemId: string) => {
    // Здесь можно добавить логику обработки клика по пункту меню
    console.log("Menu item clicked:", itemId);
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Image */}
      <div className="absolute inset-0 -z-1">
        <Image
          src={bgImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          className=""
        />
      </div>
      {/* Header */}
      <Header />

      {/* Search and Buttons */}
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

      {/* Display selected filter */}
      {selectedFilter && (
        <div className="px-4 pb-2">
          <span className="text-sm text-gray-400">
            {dict?.home.active_filter || "Active filter"}:{" "}
            {filterOptions.find((f) => f.id === selectedFilter)?.label}
          </span>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterSelect={handleFilterSelect}
        dict={dict?.home}
      />

      {/* Menu Sidebar */}
      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuItems={menuItems}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* Main Content */}
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <p className="text-gray-300">Test: {searchQuery}</p>
      </main>
    </div>
  );
}
