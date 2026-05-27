"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-gray-500 mb-6">
          Bạn chưa có sản phẩm nào trong giỏ hàng.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (showCheckout) {
    return <CheckoutForm totalPrice={getTotalPrice()} onBack={() => setShowCheckout(false)} onClearCart={clearCart} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Giỏ hàng ({items.length} sản phẩm)
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
          >
            {/* Product Emoji */}
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-3xl shrink-0">
              {getCategoryEmoji(item.product.category)}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.product.id}`}
                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-500">
                {item.product.duration || "Vĩnh viễn"}
              </p>
              <p className="text-blue-600 font-semibold mt-1">
                {formatPrice(item.product.price)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-medium text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Subtotal & Remove */}
            <div className="text-right">
              <p className="font-bold text-gray-900">
                {formatPrice(item.product.price * item.quantity)}
              </p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-red-400 hover:text-red-600 mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-medium">{formatPrice(getTotalPrice())}</span>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <span className="text-gray-600">Phí giao hàng:</span>
          <span className="font-medium text-green-600">Miễn phí</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(getTotalPrice())}
          </span>
        </div>

        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Tiến hành thanh toán
        </button>

        <Link
          href="/"
          className="block text-center mt-3 text-sm text-gray-500 hover:text-blue-600"
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

// --- Checkout Form ---

function CheckoutForm({
  totalPrice,
  onBack,
  onClearCart,
}: {
  totalPrice: number;
  onBack: () => void;
  onClearCart: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentMethod: "bank_transfer" as "bank_transfer" | "momo" | "zalopay",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onClearCart();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-500 mb-2">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        <p className="text-gray-500 mb-6">
          Thông tin tài khoản sẽ được gửi qua email sau khi xác nhận thanh toán.
        </p>

        {formData.paymentMethod === "bank_transfer" && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">
              Thông tin chuyển khoản:
            </h3>
            <p className="text-sm text-blue-800">Ngân hàng: Vietcombank</p>
            <p className="text-sm text-blue-800">STK: 1234567890</p>
            <p className="text-sm text-blue-800">Chủ TK: DIGI STORE</p>
            <p className="text-sm text-blue-800 font-medium mt-2">
              Nội dung CK: DIGISTORE {formData.phone}
            </p>
            <p className="text-sm text-blue-800 font-medium">
              Số tiền: {formatPrice(totalPrice)}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại giỏ hàng
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Thông tin khách hàng</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0901234567"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            Phương thức thanh toán
          </h2>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={formData.paymentMethod === "bank_transfer"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as typeof formData.paymentMethod,
                  })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">🏦 Chuyển khoản ngân hàng</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="momo"
                checked={formData.paymentMethod === "momo"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as typeof formData.paymentMethod,
                  })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">💜 Ví MoMo</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="zalopay"
                checked={formData.paymentMethod === "zalopay"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as typeof formData.paymentMethod,
                  })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">💙 ZaloPay</span>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Tổng thanh toán:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Xác nhận đặt hàng
        </button>
      </form>
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
