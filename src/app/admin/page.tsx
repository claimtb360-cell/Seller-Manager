"use client";

import { useState } from "react";
import {
  Package, ShoppingBag, DollarSign, Users, Eye, Trash2, Edit,
  Plus, Search, X, Save, Key, EyeOff, Copy, Check,
} from "lucide-react";
import { useProductStore } from "@/store/product-store";
import { useOrderStore } from "@/store/order-store";
import { formatPrice, formatDate } from "@/lib/utils";
import { CATEGORY_LABELS, Product, Order, AccountInfo, ProductCategory } from "@/types";

type Tab = "overview" | "products" | "accounts" | "orders";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { products } = useProductStore();
  const { orders } = useOrderStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalAccounts = products.reduce((sum, p) => sum + p.accounts.length, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trang quan tri</h1>
        <p className="text-gray-500 mt-1">Quan ly san pham, tai khoan, don hang</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Doanh thu" value={formatPrice(totalRevenue)} color="blue" />
        <StatCard icon={<ShoppingBag className="w-6 h-6" />} label="Don hang" value={`${totalOrders} (${pendingOrders} cho)`} color="green" />
        <StatCard icon={<Package className="w-6 h-6" />} label="San pham" value={totalProducts.toString()} color="purple" />
        <StatCard icon={<Key className="w-6 h-6" />} label="Tai khoan" value={totalAccounts.toString()} color="orange" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <TabBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Tong quan</TabBtn>
        <TabBtn active={activeTab === "products"} onClick={() => setActiveTab("products")}>San pham ({totalProducts})</TabBtn>
        <TabBtn active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>Tai khoan ({totalAccounts})</TabBtn>
        <TabBtn active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Don hang ({totalOrders})</TabBtn>
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "accounts" && <AccountsTab />}
      {activeTab === "orders" && <OrdersTab />}
    </div>
  );
}


// === STAT CARD ===
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
      {children}
    </button>
  );
}


// === OVERVIEW TAB ===
function OverviewTab() {
  const { products } = useProductStore();
  const { orders } = useOrderStore();
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Don hang gan day</h3>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{order.id}</p>
                <p className="text-xs text-gray-500">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatPrice(order.totalAmount)}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && <p className="text-gray-400 text-sm">Chua co don hang</p>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">San pham & Tai khoan</h3>
        <div className="space-y-3">
          {products.slice(0, 6).map((product) => {
            const available = product.accounts.filter((a) => a.status === "available").length;
            const sold = product.accounts.filter((a) => a.status === "sold").length;
            return (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryEmoji(product.category)}</span>
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{available} con</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sold} da ban</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// === PRODUCTS TAB ===
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORY_LABELS[p.category].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tim kiem san pham..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Them san pham
        </button>
      </div>

      {showAdd && <AddProductForm onClose={() => setShowAdd(false)} onAdd={addProduct} />}

      {editingId && (
        <EditProductForm
          product={products.find((p) => p.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updates) => { updateProduct(editingId, updates); setEditingId(null); }}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">San pham</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Danh muc</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Gia</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tai khoan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trang thai</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const avail = product.accounts.filter((a) => a.status === "available").length;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryEmoji(product.category)}</span>
                        <span className="font-medium text-sm text-gray-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_LABELS[product.category]}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-green-600 font-medium">{avail}</span>
                      <span className="text-gray-400">/{product.accounts.length}</span>
                    </td>
                    <td className="px-4 py-3"><ProductStatusBadge status={product.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingId(product.id)} className="p-1.5 text-gray-400 hover:text-blue-600" title="Sua">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm("Xoa san pham nay?")) deleteProduct(product.id); }} className="p-1.5 text-gray-400 hover:text-red-600" title="Xoa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// === ADD PRODUCT FORM ===
function AddProductForm({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Product) => void }) {
  const [form, setForm] = useState({ name: "", description: "", category: "streaming" as ProductCategory, price: 0, originalPrice: 0, duration: "1 thang", features: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: form.name,
      description: form.description,
      category: form.category,
      price: form.price,
      originalPrice: form.originalPrice || undefined,
      image: "",
      stock: 0,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      duration: form.duration,
      status: "available",
      createdAt: new Date().toISOString().split("T")[0],
      accounts: [],
    };
    onAdd(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Them san pham moi</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ten san pham *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mo ta</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh muc</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thoi han</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gia ban (VND) *</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gia goc (VND)</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tinh nang (cach nhau boi dau phay)</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="VD: 4K, Khong quang cao, Offline"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Them san pham</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// === EDIT PRODUCT FORM ===
function EditProductForm({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (updates: Partial<Product>) => void }) {
  const [form, setForm] = useState({
    name: product.name, description: product.description, category: product.category,
    price: product.price, originalPrice: product.originalPrice || 0,
    duration: product.duration || "", features: product.features.join(", "),
    status: product.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name, description: form.description, category: form.category,
      price: form.price, originalPrice: form.originalPrice || undefined,
      duration: form.duration,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sua san pham</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ten san pham</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mo ta</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh muc</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trang thai</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="available">Dang ban</option>
                <option value="out_of_stock">Het hang</option>
                <option value="hidden">An</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gia ban (VND)</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gia goc (VND)</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thoi han</label>
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tinh nang (dau phay)</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Save className="w-4 h-4" /> Luu thay doi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// === ACCOUNTS TAB - Main feature ===
function AccountsTab() {
  const { products, addAccount, updateAccount, deleteAccount, markAccountSold } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [showAdd, setShowAdd] = useState(false);
  const [editingAcc, setEditingAcc] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const product = products.find((p) => p.id === selectedProduct);
  const accounts = product?.accounts || [];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* Product Selector */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.accounts.filter((a) => a.status === "available").length} con / {p.accounts.length} tong)
            </option>
          ))}
        </select>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Them tai khoan
        </button>
      </div>

      {showAdd && product && (
        <AddAccountForm productId={product.id} onClose={() => setShowAdd(false)} onAdd={addAccount} />
      )}

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mat khau</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ghi chu</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trang thai</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Khach mua</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Chua co tai khoan nao. Nhan &quot;Them tai khoan&quot; de bat dau.</td></tr>
              )}
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-900">{acc.email}</span>
                      <button onClick={() => handleCopy(acc.email, `email-${acc.id}`)} className="p-1 text-gray-300 hover:text-blue-500">
                        {copied === `email-${acc.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-900">
                        {showPasswords[acc.id] ? acc.password : "••••••••"}
                      </span>
                      <button onClick={() => togglePassword(acc.id)} className="p-1 text-gray-300 hover:text-blue-500">
                        {showPasswords[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={() => handleCopy(acc.password, `pass-${acc.id}`)} className="p-1 text-gray-300 hover:text-blue-500">
                        {copied === `pass-${acc.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{acc.note || "-"}</td>
                  <td className="px-4 py-3"><AccStatusBadge status={acc.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {acc.soldTo ? <span>{acc.soldTo}<br /><span className="text-xs">{acc.soldAt}</span></span> : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {acc.status === "available" && (
                        <button onClick={() => {
                          const buyer = prompt("Email khach mua:");
                          if (buyer) markAccountSold(selectedProduct, acc.id, buyer);
                        }} className="p-1.5 text-gray-400 hover:text-green-600" title="Danh dau da ban">
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setEditingAcc(acc.id)} className="p-1.5 text-gray-400 hover:text-blue-600" title="Sua">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Xoa tai khoan nay?")) deleteAccount(selectedProduct, acc.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600" title="Xoa">
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

      {editingAcc && product && (
        <EditAccountForm
          account={product.accounts.find((a) => a.id === editingAcc)!}
          onClose={() => setEditingAcc(null)}
          onSave={(updates) => { updateAccount(selectedProduct, editingAcc, updates); setEditingAcc(null); }}
        />
      )}
    </div>
  );
}


// === ADD ACCOUNT FORM ===
function AddAccountForm({ productId, onClose, onAdd }: { productId: string; onClose: () => void; onAdd: (productId: string, account: AccountInfo) => void }) {
  const [form, setForm] = useState({ email: "", password: "", note: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(productId, {
      id: `acc-${Date.now()}`,
      email: form.email,
      password: form.password,
      note: form.note || undefined,
      status: "available",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Them tai khoan moi</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email tai khoan *</label>
            <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="account@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mat khau *</label>
            <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="password123" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chu</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Profile 1, PIN: 1234..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Them tai khoan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// === EDIT ACCOUNT FORM ===
function EditAccountForm({ account, onClose, onSave }: { account: AccountInfo; onClose: () => void; onSave: (updates: Partial<AccountInfo>) => void }) {
  const [form, setForm] = useState({ email: account.email, password: account.password, note: account.note || "", status: account.status });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ email: form.email, password: form.password, note: form.note || undefined, status: form.status });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sua tai khoan</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mat khau</label>
            <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chu</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trang thai</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AccountInfo["status"] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="available">Con hang</option>
              <option value="sold">Da ban</option>
              <option value="expired">Het han</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Save className="w-4 h-4" /> Luu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// === ORDERS TAB ===
function OrdersTab() {
  const { orders, updateOrderStatus, deleteOrder } = useOrderStore();

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ma don</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Khach hang</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">San pham</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tong tien</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trang thai</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ngay tao</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hanh dong</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Chua co don hang</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.id}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                  {order.items.map((i) => i.product.name).join(", ")}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="pending">Cho xu ly</option>
                    <option value="confirmed">Da xac nhan</option>
                    <option value="delivered">Da giao</option>
                    <option value="cancelled">Da huy</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { if (confirm("Xoa don hang nay?")) deleteOrder(order.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600" title="Xoa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// === BADGES & HELPERS ===
function StatusBadge({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<Order["status"], string> = {
    pending: "Cho xu ly",
    confirmed: "Da xac nhan",
    delivered: "Da giao",
    cancelled: "Da huy",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{labels[status]}</span>;
}

function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const styles: Record<Product["status"], string> = {
    available: "bg-green-100 text-green-700",
    out_of_stock: "bg-red-100 text-red-700",
    hidden: "bg-gray-100 text-gray-700",
  };
  const labels: Record<Product["status"], string> = {
    available: "Dang ban",
    out_of_stock: "Het hang",
    hidden: "An",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{labels[status]}</span>;
}

function AccStatusBadge({ status }: { status: AccountInfo["status"] }) {
  const styles: Record<AccountInfo["status"], string> = {
    available: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
    expired: "bg-red-100 text-red-700",
  };
  const labels: Record<AccountInfo["status"], string> = {
    available: "Con hang",
    sold: "Da ban",
    expired: "Het han",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{labels[status]}</span>;
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    streaming: "🎬", music: "🎵", cloud: "☁️", education: "📚",
    vpn: "🔒", design: "🎨", productivity: "💼", gaming: "🎮",
  };
  return emojis[category] || "📦";
}
