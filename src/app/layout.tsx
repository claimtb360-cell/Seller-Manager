import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "DigiStore Admin - Quản lý tài khoản dịch vụ số",
  description: "Hệ thống quản trị tài khoản dịch vụ số",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
