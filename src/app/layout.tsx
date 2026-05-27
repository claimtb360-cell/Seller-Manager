import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "DigiStore - Tài Khoản Dịch Vụ Số Giá Rẻ",
  description:
    "Chuyên cung cấp tài khoản dịch vụ số chính hãng: Netflix, Spotify, ChatGPT, Canva, NordVPN với giá tốt nhất. Giao hàng tự động, hỗ trợ 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
