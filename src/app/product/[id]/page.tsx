import { defaultProducts } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";

export function generateStaticParams() {
  return defaultProducts.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage() {
  return <ProductDetail />;
}
