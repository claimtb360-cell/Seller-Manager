// Types for digital service accounts marketplace

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  features: string[];
  duration?: string; // e.g., "1 tháng", "1 năm", "Vĩnh viễn"
  status: "available" | "out_of_stock" | "hidden";
  createdAt: string;
}

export type ProductCategory =
  | "streaming"
  | "music"
  | "cloud"
  | "education"
  | "vpn"
  | "design"
  | "productivity"
  | "gaming";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: "bank_transfer" | "momo" | "zalopay";
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
  accountDetails?: string; // Thông tin tài khoản gửi cho khách
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  streaming: "Xem phim & TV",
  music: "Nghe nhạc",
  cloud: "Lưu trữ đám mây",
  education: "Học tập",
  vpn: "VPN & Bảo mật",
  design: "Thiết kế",
  productivity: "Công cụ làm việc",
  gaming: "Game",
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  streaming: "🎬",
  music: "🎵",
  cloud: "☁️",
  education: "📚",
  vpn: "🔒",
  design: "🎨",
  productivity: "💼",
  gaming: "🎮",
};
