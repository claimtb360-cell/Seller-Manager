"use client";

import { ProductCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/types";

interface CategoryFilterProps {
  selectedCategory: ProductCategory | "all";
  onCategoryChange: (category: ProductCategory | "all") => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const categories: (ProductCategory | "all")[] = [
    "all",
    "streaming",
    "music",
    "cloud",
    "education",
    "vpn",
    "design",
    "productivity",
    "gaming",
  ];

  return (
    <div id="categories" className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <span>{cat === "all" ? "🏪" : CATEGORY_ICONS[cat]}</span>
          <span>{cat === "all" ? "Tất cả" : CATEGORY_LABELS[cat]}</span>
        </button>
      ))}
    </div>
  );
}
