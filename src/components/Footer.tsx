import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold text-white">
                Digi<span className="text-blue-400">Store</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Chuyên cung cấp tài khoản dịch vụ số chính hãng với giá tốt nhất thị trường.
              Giao hàng tự động, hỗ trợ 24/7.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/#categories" className="hover:text-blue-400 transition-colors">
                  Danh mục sản phẩm
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-blue-400 transition-colors">
                  Giỏ hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 support@digistore.vn</li>
              <li>📱 Zalo: 0901 234 567</li>
              <li>💬 Telegram: @digistore_support</li>
              <li>⏰ Hỗ trợ 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2024 DigiStore. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
