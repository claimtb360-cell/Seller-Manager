"use client";

import { useState } from "react";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Eye,
  Trash2,
  Edit,
  Plus,
  Search,
} from "lucide-react";
import { products } from "@/data/products";
import { sampleOrders } from "@/data/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { CATEGORY_LABELS, Product, Order } from "@/types";

type Tab = "overview" | "products" | "orders";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const totalRevenue = sampleOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = sampleOrders.length;
  const totalProducts = products.length;
  const pendingOrders = sampleOrders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trang quản trị</h1>
        <p className="text-gray-500 mt-1">Quản lý sản phẩm, đơn hàng và doanh thu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Doanh thu"
          value={formatPrice(totalRevenue)}
          color="blue"
        />
        <StatCard
          icon={<ShoppingBag className="w-6 h-6" />}
          label="Đơn hàng"
          value={totalOrders.toString()}
          color="green"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Sản phẩm"
          value={totalProducts.toString()}
          color="purple"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Chờ xử lý"
          value={pendingOrders.toString()}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          Tổng quan
        </TabButton>
        <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")}>
          Sản phẩm ({totalProducts})
        </TabButton>
        <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>
          Đơn hàng ({totalOrders})
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "products" && (
        <ProductsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      {activeTab === "orders" && <OrdersTab />}
    </div>
  );
}

// --- Sub Components ---

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab() {
  const recentOrders = sampleOrders.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h3>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{order.id}</p>
                <p className="text-xs text-gray-500">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-gray-900">
                  {formatPrice(order.totalAmount)}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryEmoji(product.category)}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {CATEGORY_LABELS[product.category]}
                  </p>
                </div>
              </div>
              <span className="font-medium text-sm text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsTab({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CATEGORY_LABELS[p.category].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Sản phẩm
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Danh mục
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Giá
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Kho
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getCategoryEmoji(product.category)}
                      </span>
                      <span className="font-medium text-sm text-gray-900 line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {CATEGORY_LABELS[product.category]}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Mã đơn
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Khách hàng
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Sản phẩm
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Tổng tiền
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Thanh toán
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sampleOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                  {order.id}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.items.map((item) => item.product.name).join(", ")}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <PaymentMethodBadge method={order.paymentMethod} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Badges ---

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<Order["status"], string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const styles: Record<Product["status"], string> = {
    available: "bg-green-100 text-green-700",
    out_of_stock: "bg-red-100 text-red-700",
    hidden: "bg-gray-100 text-gray-700",
  };
  const labels: Record<Product["status"], string> = {
    available: "Đang bán",
    out_of_stock: "Hết hàng",
    hidden: "Ẩn",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: Order["paymentMethod"] }) {
  const labels: Record<Order["paymentMethod"], string> = {
    bank_transfer: "Chuyển khoản",
    momo: "MoMo",
    zalopay: "ZaloPay",
  };

  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
      {labels[method]}
    </span>
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
