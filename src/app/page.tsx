"use client";

import { useState } from "react";
import {
  Package, Key, Plus, Search, Trash2, Edit, Eye, EyeOff,
  Copy, Check, X, Save, ShoppingBag,
} from "lucide-react";
import { useProductStore } from "@/store/product-store";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS, Product, AccountInfo, ProductCategory } from "@/types";

type Tab = "products" | "accounts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const { products } = useProductStore();
  const totalAccounts = products.reduce((s, p) => s + p.accounts.length, 0);
  const availableAccounts = products.reduce(
    (s, p) => s + p.accounts.filter((a) => a.status === "available").length, 0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              DigiStore <span className="text-blue-600">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{products.length} san pham</span>
            <span className="text-green-600 font-medium">{availableAccounts}/{totalAccounts} tai khoan con</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-1 bg-white rounded-lg p-1 w-fit border border-gray-200">
          <button onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "products" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            San pham ({products.length})
          </button>
          <button onClick={() => setActiveTab("accounts")}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "accounts" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            Tai khoan ({totalAccounts})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "products" && <ProductsPanel />}
        {activeTab === "accounts" && <AccountsPanel />}
      </div>
    </div>
  );
}



// ========== PRODUCTS PANEL ==========
function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tim kiem san pham..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Them san pham
        </button>
      </div>

      {showAdd && <ProductForm onClose={() => setShowAdd(false)} onSave={(p) => { addProduct(p); setShowAdd(false); }} />}
      {editingId && (
        <ProductForm
          product={products.find((p) => p.id === editingId)}
          onClose={() => setEditingId(null)}
          onSave={(updates) => { updateProduct(editingId, updates); setEditingId(null); }}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">San pham</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Danh muc</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Gia</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tai khoan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trang thai</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((product) => {
              const avail = product.accounts.filter((a) => a.status === "available").length;
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_LABELS[product.category]}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-green-600 font-medium">{avail}</span>
                    <span className="text-gray-400"> / {product.accounts.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.status === "available" ? "bg-green-100 text-green-700" : product.status === "hidden" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"}`}>
                      {product.status === "available" ? "Dang ban" : product.status === "hidden" ? "An" : "Het hang"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingId(product.id)} className="p-1.5 text-gray-400 hover:text-blue-600" title="Sua">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Xoa san pham nay?")) deleteProduct(product.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600" title="Xoa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Khong co san pham nao</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ========== ACCOUNTS PANEL ==========
function AccountsPanel() {
  const { products, addAccount, updateAccount, deleteAccount, markAccountSold } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [showAdd, setShowAdd] = useState(false);
  const [editingAcc, setEditingAcc] = useState<string | null>(null);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const product = products.find((p) => p.id === selectedProduct);
  const accounts = product?.accounts || [];

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
          className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.accounts.filter((a) => a.status === "available").length} con / {p.accounts.length} tong
            </option>
          ))}
        </select>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Them tai khoan
        </button>
      </div>

      {showAdd && product && (
        <AccountForm onClose={() => setShowAdd(false)} onSave={(acc) => { addAccount(product.id, acc); setShowAdd(false); }} />
      )}
      {editingAcc && product && (
        <AccountForm
          account={product.accounts.find((a) => a.id === editingAcc)}
          onClose={() => setEditingAcc(null)}
          onSave={(updates) => { updateAccount(selectedProduct, editingAcc, updates); setEditingAcc(null); }}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mat khau</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ghi chu</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trang thai</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Khach mua</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chua co tai khoan. Nhan "Them tai khoan" de bat dau.</td></tr>
            )}
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{acc.email}</span>
                    <button onClick={() => copy(acc.email, `e-${acc.id}`)} className="p-0.5 text-gray-300 hover:text-blue-500">
                      {copied === `e-${acc.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{showPw[acc.id] ? acc.password : "••••••••"}</span>
                    <button onClick={() => setShowPw((p) => ({ ...p, [acc.id]: !p[acc.id] }))} className="p-0.5 text-gray-300 hover:text-blue-500">
                      {showPw[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => copy(acc.password, `p-${acc.id}`)} className="p-0.5 text-gray-300 hover:text-blue-500">
                      {copied === `p-${acc.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{acc.note || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${acc.status === "available" ? "bg-green-100 text-green-700" : acc.status === "sold" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                    {acc.status === "available" ? "Con hang" : acc.status === "sold" ? "Da ban" : "Het han"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {acc.soldTo || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {acc.status === "available" && (
                      <button onClick={() => { const b = prompt("Email khach mua:"); if (b) markAccountSold(selectedProduct, acc.id, b); }}
                        className="p-1.5 text-gray-400 hover:text-green-600" title="Danh dau da ban">
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
  );
}



// ========== PRODUCT FORM (Add/Edit) ==========
function ProductForm({ product, onClose, onSave }: { product?: Product; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || ("streaming" as ProductCategory),
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    duration: product?.duration || "1 thang",
    features: product?.features?.join(", ") || "",
    status: product?.status || ("available" as Product["status"]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({
        name: form.name, description: form.description, category: form.category,
        price: form.price, originalPrice: form.originalPrice || undefined,
        duration: form.duration, status: form.status,
        features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      });
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`, name: form.name, description: form.description,
        category: form.category, price: form.price, originalPrice: form.originalPrice || undefined,
        image: "", stock: 0, duration: form.duration, status: "available",
        features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
        createdAt: new Date().toISOString().split("T")[0], accounts: [],
      };
      onSave(newProduct);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{product ? "Sua san pham" : "Them san pham"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Ten san pham *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Mo ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input placeholder="Thoi han" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" required placeholder="Gia ban *" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Gia goc" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input placeholder="Tinh nang (dau phay)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {product && (
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="available">Dang ban</option>
              <option value="out_of_stock">Het hang</option>
              <option value="hidden">An</option>
            </select>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {product ? "Luu" : "Them"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== ACCOUNT FORM (Add/Edit) ==========
function AccountForm({ account, onClose, onSave }: { account?: AccountInfo; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    email: account?.email || "",
    password: account?.password || "",
    note: account?.note || "",
    status: account?.status || ("available" as AccountInfo["status"]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account) {
      onSave({ email: form.email, password: form.password, note: form.note || undefined, status: form.status });
    } else {
      onSave({ id: `acc-${Date.now()}`, email: form.email, password: form.password, note: form.note || undefined, status: "available" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{account ? "Sua tai khoan" : "Them tai khoan"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Email tai khoan *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required placeholder="Mat khau *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Ghi chu (Profile, PIN...)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {account && (
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AccountInfo["status"] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="available">Con hang</option>
              <option value="sold">Da ban</option>
              <option value="expired">Het han</option>
            </select>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {account ? "Luu" : "Them"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
