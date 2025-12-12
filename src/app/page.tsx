import Store from '@/components/Store';
import { getProducts } from '@/lib/productParser';

// Revalidate every hour or on-demand
export const revalidate = 3600;

export default function Home() {
  const products = getProducts();

  return (
    <div className="bg-lilac-50 min-h-screen">
      <Store products={products} />
    </div>
  );
}
