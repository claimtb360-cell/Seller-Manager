import { Zap, Shield, Clock } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Tài Khoản Dịch Vụ Số
          </h1>
          <h2 className="text-xl md:text-2xl font-light mb-6 text-blue-100">
            Giá Rẻ Nhất - Giao Hàng Tự Động
          </h2>
          <p className="text-blue-200 max-w-2xl mx-auto mb-10">
            Netflix, Spotify, ChatGPT, Canva, NordVPN và hàng trăm dịch vụ khác.
            Giá chỉ từ 19.000đ. Giao tài khoản ngay sau khi thanh toán.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">Giao hàng tự động</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <Shield className="w-5 h-5 text-green-300" />
              <span className="text-sm font-medium">Bảo hành đổi mới</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <Clock className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-medium">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
