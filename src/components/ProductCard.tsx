"use client";

import Link from "next/link";
import { ShoppingCart, Tag } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = getDiscountPercent(product.price, product.originalPrice);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
      {/* Image & Badge */}
      <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center h-40">
        <div className="text-5xl">{getCategoryEmoji(product.category)}</div>
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.duration && (
          <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
            {product.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock & Action */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Còn {product.stock} sản phẩm
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Mua
          </button>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    streaming: "🎬",
    music: "🎵",
    cloud: "☁️",
    education: "📚",
    vpn: "🔒",
    design: "🎨",
    productivity: "💼",
    gaming: "🎮",
  };
  return emojis[category] || "📦";
}
