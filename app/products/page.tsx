import Link from 'next/link';
import { apiGet } from '../lib/api';
import { Product } from '../../types';

export default async function ProductsPage() {
  let products: Product[] = [];
  let materials: any[] = [];

  try { 
    products = await apiGet<Product[]>('/inventory/products'); 
  } catch (e) { 
    products = []; 
  }

  try { 
    materials = await apiGet<any[]>('/materials'); 
  } catch (e) { 
    materials = []; 
  }

  return (
    <section>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <div className="flex gap-2">
          <Link
            href="/products/create-product"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Product
          </Link>
          <Link
            href="/products/create-material"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Material
          </Link>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <h2 className="text-xl font-semibold text-white mb-3">Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">

        {products.map((p, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
            
            <div className="w-full h-40 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
              {p.image ? (
                <img
                  src={`http://localhost:5000/${p.image}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>

            <div className="mt-3">
              <div className="font-bold text-white">{p.name}</div>
              <div className="text-sm text-gray-400">Type: {p.type}</div>
              <div className="text-sm text-gray-400">Ref: {p.internalReference}</div>
              <div className="text-sm text-cyan-300 font-semibold">Rp {p.salePrice}</div>
            </div>
          </div>
        ))}

      </div>

      {/* MATERIAL LIST */}
      <h2 className="text-xl font-semibold text-white mb-3">Materials</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {materials.map((m, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">

            <div className="w-full h-40 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
              {m.image ? (
                <img
                  src={`http://localhost:5000/${m.image}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>

            <div className="mt-3">
              <div className="font-bold text-white">{m.name}</div>
              <div className="text-sm text-gray-400">Type: {m.type}</div>
              <div className="text-sm text-gray-400">Ref: {m.internalReference}</div>
              <div className="text-sm text-cyan-300 font-semibold">Cost: Rp {m.cost}</div>
              <div className="text-sm text-gray-300">Weight: {m.weight} gr</div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
