"use client";

import { useState } from "react";
import { ProductCategory } from "@/types";
import { products } from "@/data/products";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");

  const filteredProducts =
    selectedCategory === "all"
      ? products.filter((p) => p.status === "available")
      : products.filter(
          (p) => p.category === selectedCategory && p.status === "available"
        );

  return (
    <div>
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Danh mục sản phẩm
          </h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào trong danh mục này.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-500 mt-1">Khách hàng</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">1000+</div>
            <div className="text-sm text-gray-500 mt-1">Đơn hàng</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">99%</div>
            <div className="text-sm text-gray-500 mt-1">Hài lòng</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-500 mt-1">Hỗ trợ</div>
          </div>
        </div>
      </section>
    </div>
  );
}
