import Store from '@/components/Store';
import { getProducts, getTzitzitImage } from '@/lib/productParser';

// Revalidate every hour or on-demand
export const revalidate = 3600;

export default async function Home() {
  const [products, tzitzitImage] = await Promise.all([
    getProducts(),
    getTzitzitImage()
  ]);

  return (
    <div className="bg-lilac-50 min-h-screen">
      <Store products={products} tzitzitImage={tzitzitImage} />
    </div>
  );
}
