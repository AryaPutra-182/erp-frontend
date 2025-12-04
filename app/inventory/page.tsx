'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api' // Pastikan path ini benar

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Load Produk & Material sekaligus
        const [prodRes, matRes] = await Promise.all([
            apiGet<any[]>('/inventory/products'), // Endpoint Barang Jadi
            apiGet<any[]>('/materials')           // Endpoint Bahan Baku
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

  // Pilih data berdasarkan Tab
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
          <p className="text-gray-400 text-sm mt-1 ml-11">
            Manage master data, stock levels, and valuations.
          </p>
        </div>

        <div className="flex gap-3">
            {/* Tombol Create tergantung Tab */}
            <Link
                href={activeTab === 'products' ? "/inventory/products/create" : "/inventory/materials/create"}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-900/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New {activeTab === 'products' ? 'Product' : 'Material'}
            </Link>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-6 border-b border-gray-800 mb-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 ${activeTab === 'products' ? 'text-purple-400 border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Finished Goods ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 ${activeTab === 'materials' ? 'text-purple-400 border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Raw Materials ({materials.length})
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
                {/* Image Placeholder */}
                <div className="h-32 bg-gray-800 flex items-center justify-center relative">
                    {/* Jika ada gambar, tampilkan di sini. Kalau tidak ada, pakai icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    
                    {/* Badge Price */}
                    <div className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur border border-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                        {formatRupiah(item.salePrice || item.price || 0)}
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
                       <p className="text-xs text-gray-500 font-mono mt-1">
                          REF: {item.internalReference || item.sku || "-"}
                       </p>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-2 border-t border-gray-800 pt-4">
                       <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                           <span className="block text-xs text-gray-500 uppercase">On Hand</span>
                           <span className={`block text-lg font-bold ${Number(item.quantity || item.weight || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {Number(item.quantity || item.weight || 0)}
                           </span>
                       </div>
                       <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                           <span className="block text-xs text-gray-500 uppercase">Cost</span>
                           <span className="block text-sm font-bold text-gray-300 mt-1">
                               {formatRupiah(item.cost || item.purchasePrice || 0)}
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