"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart, Check, Clock, Shield } from "lucide-react";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";

export default function ProductDetail() {
  const params = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Không tìm thấy sản phẩm
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const discount = getDiscountPercent(product.price, product.originalPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left - Image */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 flex items-center justify-center min-h-[300px]">
          <div className="text-8xl">{getCategoryEmoji(product.category)}</div>
        </div>

        {/* Right - Details */}
        <div>
          {/* Category & Duration */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              {CATEGORY_LABELS[product.category]}
            </span>
            {product.duration && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.duration}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  -{discount}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Còn {product.stock} sản phẩm trong kho
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Tính năng bao gồm:
            </h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ hàng
            </button>
            <Link
              href="/cart"
              onClick={() => addItem(product)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-center"
            >
              Mua ngay
            </Link>
          </div>

          {/* Guarantees */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <Shield className="w-4 h-4" />
              Cam kết chất lượng
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Bảo hành đổi mới nếu lỗi do shop</li>
              <li>✓ Giao tài khoản ngay sau thanh toán</li>
              <li>✓ Hỗ trợ cài đặt & sử dụng</li>
            </ul>
          </div>
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
