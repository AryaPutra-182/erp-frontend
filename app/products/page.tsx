import Link from 'next/link';
import { apiGet } from '../lib/api';
import Table from '../../components/Table';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Product } from '../../types';

export default async function ProductsPage() {
  let products: Product[] = [];

  try { 
    products = await apiGet<Product[]>('/inventory/products'); 
  } catch (e) { 
    products = []; 
  }

  const columns = ['Name', 'Type', 'Price', 'Reference'];

  const data = products.map(p => ({
    name: p.name,
    type: p.type ?? '',
    price: p.salePrice ?? 0,
    reference: p.internalReference ?? ''

  }));

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex gap-2">
          <Link
            href="/products/create-product"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Products
          </Link>
          <Link
            href="/products/create-material"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Materials
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </section>
  );
}
