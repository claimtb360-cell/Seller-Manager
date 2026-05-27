"use client";

import { useState, useMemo, useRef } from "react";
import {
  Package, Plus, Search, Trash2, Edit, Eye, EyeOff, Copy, Check,
  X, Save, Download, Upload, ChevronDown, CheckSquare, Square,
  ShoppingBag, Filter, LayoutGrid,
} from "lucide-react";
import { useProductStore } from "@/store/product-store";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_ICONS, Product, AccountInfo, ProductCategory } from "@/types";

export default function AdminDashboard() {
  const { products } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [view, setView] = useState<"products" | "accounts">("products");

  const totalAccounts = products.reduce((s, p) => s + p.accounts.length, 0);
  const availableAccounts = products.reduce(
    (s, p) => s + p.accounts.filter((a) => a.status === "available").length, 0
  );

  const categories: (ProductCategory | "all")[] = ["all", ...Object.keys(CATEGORY_LABELS) as ProductCategory[]];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold">Digi<span className="text-blue-600">Store</span></h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Quan ly tai khoan dich vu so</p>
        </div>


        {/* Stats */}
        <div className="p-4 border-b border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">San pham</span>
            <span className="font-semibold">{products.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tai khoan con</span>
            <span className="font-semibold text-green-600">{availableAccounts}/{totalAccounts}</span>
          </div>
        </div>

        {/* Category Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <p className="text-xs font-medium text-gray-400 uppercase px-3 py-2">Danh muc</p>
          {categories.map((cat) => {
            const count = cat === "all" ? products.length : products.filter((p) => p.category === cat).length;
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${selectedCategory === cat ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                <span className="flex items-center gap-2">
                  <span>{cat === "all" ? "📦" : CATEGORY_ICONS[cat]}</span>
                  <span>{cat === "all" ? "Tat ca" : CATEGORY_LABELS[cat]}</span>
                </span>
                <span className={`text-xs ${selectedCategory === cat ? "text-blue-600" : "text-gray-400"}`}>{count}</span>
              </button>
            );
          })}
        </nav>

        {/* View Toggle */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("products")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "products" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              San pham
            </button>
            <button onClick={() => setView("accounts")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "accounts" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              Tai khoan
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {view === "products" ? (
          <ProductsView products={filteredProducts} category={selectedCategory} />
        ) : (
          <AccountsView products={filteredProducts} category={selectedCategory} />
        )}
      </main>
    </div>
  );
}



// ==================== PRODUCTS VIEW ====================
function ProductsView({ products, category }: { products: Product[]; category: ProductCategory | "all" }) {
  const { addProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const bulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Xoa ${selected.size} san pham?`)) return;
    selected.forEach((id) => deleteProduct(id));
    setSelected(new Set());
  };

  const exportCSV = () => {
    const rows = [["ID", "Ten", "Danh muc", "Gia", "Gia goc", "Thoi han", "Trang thai", "Tinh nang"]];
    filtered.forEach((p) => {
      rows.push([p.id, p.name, p.category, String(p.price), String(p.originalPrice || ""), p.duration || "", p.status, p.features.join("; ")]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1);
      lines.forEach((line) => {
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 4) return;
        const clean = (s: string) => s.replace(/^"|"$/g, "").trim();
        const p: Product = {
          id: clean(cols[0]) || `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: clean(cols[1]),
          category: (clean(cols[2]) || "streaming") as ProductCategory,
          price: Number(clean(cols[3])) || 0,
          originalPrice: Number(clean(cols[4])) || undefined,
          duration: clean(cols[5]) || "1 thang",
          status: (clean(cols[6]) || "available") as Product["status"],
          features: clean(cols[7] || "").split(";").map((f) => f.trim()).filter(Boolean),
          description: "", image: "", stock: 0,
          createdAt: new Date().toISOString().split("T")[0], accounts: [],
        };
        if (p.name) addProduct(p);
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">San pham</h2>
          <p className="text-sm text-gray-500">{filtered.length} san pham {category !== "all" && `trong "${CATEGORY_LABELS[category]}"`}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileRef} accept=".csv" className="hidden" onChange={importCSV} />
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Them san pham
          </button>
        </div>
      </div>


      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tim kiem..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {selected.size > 0 && (
          <button onClick={bulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">
            <Trash2 className="w-4 h-4" /> Xoa {selected.size} muc
          </button>
        )}
      </div>

      {/* Forms */}
      {showForm && <ProductForm onClose={() => setShowForm(false)} onSave={(p) => { addProduct(p); setShowForm(false); }} defaultCategory={category !== "all" ? category : undefined} />}
      {editingId && <ProductForm product={products.find((p) => p.id === editingId)} onClose={() => setEditingId(null)} onSave={(u) => { updateProduct(editingId, u); setEditingId(null); }} />}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3"><button onClick={toggleAll}>{allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">San pham</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Danh muc</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gia</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tai khoan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trang thai</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((product) => {
              const avail = product.accounts.filter((a) => a.status === "available").length;
              const isSelected = selected.has(product.id);
              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50/50" : ""}`}>
                  <td className="px-4 py-3"><button onClick={() => toggle(product.id)}>{isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-300" />}</button></td>
                  <td className="px-4 py-3"><span className="font-medium text-sm text-gray-900">{product.name}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_ICONS[product.category]} {CATEGORY_LABELS[product.category]}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-sm"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">{avail} con</span><span className="text-gray-400 text-xs ml-1">/ {product.accounts.length}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${product.status === "available" ? "bg-emerald-100 text-emerald-700" : product.status === "hidden" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"}`}>{product.status === "available" ? "Dang ban" : product.status === "hidden" ? "An" : "Het hang"}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => setEditingId(product.id)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm("Xoa?")) deleteProduct(product.id); }} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Khong co san pham nao</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ==================== ACCOUNTS VIEW ====================
function AccountsView({ products, category }: { products: Product[]; category: ProductCategory | "all" }) {
  const { addAccount, updateAccount, deleteAccount, markAccountSold } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<string | null>(null);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const product = products.find((p) => p.id === selectedProduct) || products[0];
  const accounts = product?.accounts || [];

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); };
  const allSelected = accounts.length > 0 && selected.size === accounts.length;
  const toggleAll = () => { if (allSelected) setSelected(new Set()); else setSelected(new Set(accounts.map((a) => a.id))); };
  const toggle = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const bulkDelete = () => {
    if (!product || selected.size === 0) return;
    if (!confirm(`Xoa ${selected.size} tai khoan?`)) return;
    selected.forEach((id) => deleteAccount(product.id, id));
    setSelected(new Set());
  };

  const exportCSV = () => {
    if (!product) return;
    const rows = [["Email", "Mat khau", "Ghi chu", "Trang thai", "Khach mua", "Ngay ban"]];
    accounts.forEach((a) => { rows.push([a.email, a.password, a.note || "", a.status, a.soldTo || "", a.soldAt || ""]); });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `accounts-${product.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1);
      let count = 0;
      lines.forEach((line) => {
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 2) return;
        const clean = (s: string) => s.replace(/^"|"$/g, "").trim();
        const acc: AccountInfo = {
          id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          email: clean(cols[0]),
          password: clean(cols[1]),
          note: clean(cols[2] || ""),
          status: (clean(cols[3] || "") || "available") as AccountInfo["status"],
        };
        if (acc.email && acc.password) { addAccount(product.id, acc); count++; }
      });
      alert(`Da import ${count} tai khoan`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tai khoan</h2>
          <p className="text-sm text-gray-500">{accounts.length} tai khoan {product && `cua "${product.name}"`}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileRef} accept=".csv" className="hidden" onChange={importCSV} />
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Them tai khoan
          </button>
        </div>
      </div>


      {/* Product selector + bulk actions */}
      <div className="flex items-center gap-3 mb-4">
        <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); setSelected(new Set()); }}
          className="flex-1 max-w-md px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.accounts.filter((a) => a.status === "available").length} con / {p.accounts.length}</option>
          ))}
        </select>
        {selected.size > 0 && (
          <button onClick={bulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">
            <Trash2 className="w-4 h-4" /> Xoa {selected.size} muc
          </button>
        )}
      </div>

      {/* Forms */}
      {showForm && product && <AccountForm onClose={() => setShowForm(false)} onSave={(acc) => { addAccount(product.id, acc); setShowForm(false); }} />}
      {editingAcc && product && <AccountForm account={product.accounts.find((a) => a.id === editingAcc)} onClose={() => setEditingAcc(null)} onSave={(u) => { updateAccount(product.id, editingAcc, u); setEditingAcc(null); }} />}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3"><button onClick={toggleAll}>{allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mat khau</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ghi chu</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trang thai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Khach mua</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Chua co tai khoan. Import hoac them thu cong.</td></tr>}
            {accounts.map((acc) => {
              const isSelected = selected.has(acc.id);
              return (
                <tr key={acc.id} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50/50" : ""}`}>
                  <td className="px-4 py-3"><button onClick={() => toggle(acc.id)}>{isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-300" />}</button></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-900">{acc.email}</span>
                      <button onClick={() => copy(acc.email, `e-${acc.id}`)} className="p-0.5 text-gray-300 hover:text-blue-500">{copied === `e-${acc.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-900">{showPw[acc.id] ? acc.password : "••••••••"}</span>
                      <button onClick={() => setShowPw((p) => ({ ...p, [acc.id]: !p[acc.id] }))} className="p-0.5 text-gray-300 hover:text-blue-500">{showPw[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                      <button onClick={() => copy(acc.password, `p-${acc.id}`)} className="p-0.5 text-gray-300 hover:text-blue-500">{copied === `p-${acc.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{acc.note || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${acc.status === "available" ? "bg-emerald-100 text-emerald-700" : acc.status === "sold" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{acc.status === "available" ? "Con hang" : acc.status === "sold" ? "Da ban" : "Het han"}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{acc.soldTo || "—"}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    {acc.status === "available" && product && <button onClick={() => { const b = prompt("Email khach:"); if (b) markAccountSold(product.id, acc.id, b); }} className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50"><ShoppingBag className="w-4 h-4" /></button>}
                    <button onClick={() => setEditingAcc(acc.id)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if (product && confirm("Xoa?")) deleteAccount(product.id, acc.id); }} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ==================== PRODUCT FORM ====================
function ProductForm({ product, onClose, onSave, defaultCategory }: { product?: Product; onClose: () => void; onSave: (data: any) => void; defaultCategory?: ProductCategory }) {
  const [form, setForm] = useState({
    name: product?.name || "", description: product?.description || "",
    category: product?.category || defaultCategory || ("streaming" as ProductCategory),
    price: product?.price || 0, originalPrice: product?.originalPrice || 0,
    duration: product?.duration || "1 thang", features: product?.features?.join(", ") || "",
    status: product?.status || ("available" as Product["status"]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({ name: form.name, description: form.description, category: form.category, price: form.price, originalPrice: form.originalPrice || undefined, duration: form.duration, status: form.status, features: form.features.split(",").map((f) => f.trim()).filter(Boolean) });
    } else {
      onSave({ id: `prod-${Date.now()}`, name: form.name, description: form.description, category: form.category, price: form.price, originalPrice: form.originalPrice || undefined, image: "", stock: 0, duration: form.duration, status: "available", features: form.features.split(",").map((f) => f.trim()).filter(Boolean), createdAt: new Date().toISOString().split("T")[0], accounts: [] } as Product);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{product ? "Sua san pham" : "Them san pham moi"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Ten san pham</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mo ta</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Danh muc</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">{Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Thoi han</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Gia ban (VND)</label><input type="number" required value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Gia goc</label><input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tinh nang (dau phay)</label><input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="4K, Khong quang cao, Offline" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          {product && <div><label className="block text-sm font-medium text-gray-700 mb-1">Trang thai</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="available">Dang ban</option><option value="out_of_stock">Het hang</option><option value="hidden">An</option></select></div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><Save className="w-4 h-4" />{product ? "Luu" : "Them"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ACCOUNT FORM ====================
function AccountForm({ account, onClose, onSave }: { account?: AccountInfo; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ email: account?.email || "", password: account?.password || "", note: account?.note || "", status: account?.status || ("available" as AccountInfo["status"]) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account) { onSave({ email: form.email, password: form.password, note: form.note || undefined, status: form.status }); }
    else { onSave({ id: `acc-${Date.now()}`, email: form.email, password: form.password, note: form.note || undefined, status: "available" }); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{account ? "Sua tai khoan" : "Them tai khoan moi"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mat khau</label><input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Ghi chu</label><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Profile, PIN..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          {account && <div><label className="block text-sm font-medium text-gray-700 mb-1">Trang thai</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AccountInfo["status"] })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="available">Con hang</option><option value="sold">Da ban</option><option value="expired">Het han</option></select></div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Huy</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"><Save className="w-4 h-4" />{account ? "Luu" : "Them"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
