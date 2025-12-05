'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api' // Pastikan path ini benar

const API_BASE_URL = "http://localhost:5000";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'materials'>('products')

  // Helper Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  }

  // Helper Get Image URL (Gabungan Logic)
  const getImageUrl = (item: any, type: 'products' | 'materials') => {
    if (!item.image) return null;

    // Bersihkan path dari backslash (issue di Windows)
    const cleanPath = item.image.replace(/\\/g, "/");

    if (type === 'materials') {
        // Logic Material dari kode kedua: masuk folder /uploads/
        return `${API_BASE_URL}/uploads/${cleanPath}`;
    } else {
        // Logic Product dari kode kedua: langsung di root public/static backend
        return `${API_BASE_URL}/${cleanPath}`;
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [prodRes, matRes] = await Promise.all([
            apiGet<any[]>('/inventory/products'), 
            apiGet<any[]>('/materials')
        ])
        setProducts(prodRes || [])
        setMaterials(matRes || [])
      } catch (e) {
        console.error("Gagal load inventory", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const displayData = activeTab === 'products' ? products : materials;

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
             Inventory & Stock
          </h1>
          
        </div>

       
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-6 border-b border-gray-800 mb-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 ${activeTab === 'products' ? 'text-purple-400 border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Products ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 ${activeTab === 'materials' ? 'text-purple-400 border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Materials ({materials.length})
          </button>
      </div>

      {/* INVENTORY GRID */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-900 rounded-xl border border-gray-800"></div>)}
         </div>
      ) : displayData.length === 0 ? (
         <div className="text-center py-20 bg-[#161b22] border border-gray-800 border-dashed rounded-xl">
            <p className="text-gray-500">No items found in this category.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {displayData.map((item, idx) => (
             <div 
               key={idx}
               className="group relative bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1"
             >
                {/* Image Section dengan Logic Spesifik */}
                <div className="h-40 bg-gray-800 flex items-center justify-center relative overflow-hidden">
                   {item.image ? (
                     <img 
                       src={getImageUrl(item, activeTab) || ""}
                       alt={item.name} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       onError={(e) => {
                         (e.target as HTMLImageElement).style.display = 'none';
                         (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                       }}
                     />
                   ) : null}

                   {/* Fallback Icon */}
                   <div className={`flex flex-col items-center justify-center text-gray-600 ${item.image ? 'hidden' : ''}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                   </div>
                   
                   {/* Badge Price / Cost */}
                   <div className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur border border-gray-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                       {formatRupiah(item.salePrice || item.cost || 0)}
                   </div>
                </div>

                <div className="p-5">
                   <div className="mb-4">
                       <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          {activeTab === 'products' ? 'Finished Product' : 'Raw Material'}
                       </p>
                       <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1" title={item.name}>
                          {item.name}
                       </h3>
                       <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 font-mono">
                            REF: {item.internalReference || item.sku || "-"}
                          </p>
                          <p className="text-xs text-gray-400">
                             Type: {item.type}
                          </p>
                       </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-2 border-t border-gray-800 pt-4">
                       <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                           <span className="block text-xs text-gray-500 uppercase">
                               {activeTab === 'materials' ? 'Weight (gr)' : 'Stock'}
                           </span>
                           <span className={`block text-lg font-bold ${Number(item.quantity || item.weight || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {Number(item.quantity || item.weight || 0)}
                           </span>
                       </div>
                       <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                           <span className="block text-xs text-gray-500 uppercase">
                               {activeTab === 'products' ? 'Sale Price' : 'Cost'}
                           </span>
                           <span className="block text-sm font-bold text-gray-300 mt-1">
                               {formatRupiah(item.salePrice || item.cost || 0)}
                           </span>
                       </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </section>
  )
}