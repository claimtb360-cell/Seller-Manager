import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Seller-Manager",
  assetPrefix: "/Seller-Manager/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
