'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api' // Sesuaikan path lib/api

// GANTI DENGAN URL BACKEND KAMU
const API_BASE_URL = "http://localhost:5000";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMaterials: 0,
    totalValue: 0,
    lowStockCount: 0
  })

  // State untuk Keuangan
  const [finance, setFinance] = useState({
    income: 0,
    expense: 0,
    profit: 0
  })

  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Helper Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  }

  // Helper Image
  const getImageUrl = (item: any, type: 'product' | 'material') => {
    if (!item.image) return null;
    const cleanPath = item.image.replace(/\\/g, "/");
    return type === 'material' 
      ? `${API_BASE_URL}/uploads/${cleanPath}` 
      : `${API_BASE_URL}/${cleanPath}`;
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch Data
        const [products, materials, sales, purchases] = await Promise.all([
            apiGet<any[]>('/inventory/products').catch(() => []),
            apiGet<any[]>('/materials').catch(() => []),
            apiGet<any[]>('/sales').catch(() => []), 
            apiGet<any[]>('/purchase').catch(() => []) 
        ])

        const allProducts = products || [];
        const allMaterials = materials || [];
        const allSales = sales || [];
        const allPurchases = purchases || [];
        
        // 2. Hitung Nilai Inventaris
        const prodValue = allProducts.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.salePrice || 0)), 0);
        const matValue = allMaterials.reduce((acc, curr) => acc + (Number(curr.weight || 0) * Number(curr.cost || 0)), 0);
        
        // 3. Hitung KEUANGAN (Income & Expense)
        const totalIncome = allSales.reduce((acc: number, curr: any) => {
            // Cek Header
            let val = Number(curr.totalAmount) || Number(curr.total) || Number(curr.grandTotal) || 0;
            
            // Fallback: Hitung dari Items
            if (val === 0) {
                const items = curr.items || curr.SalesItems || [];
                if (Array.isArray(items)) {
                    val = items.reduce((sum: number, it: any) => {
                        const qty = Number(it.quantity || it.qty || 0);
                        const price = Number(it.unitPrice || it.price || it.salePrice || it.Product?.salePrice || 0);
                        return sum + (qty * price);
                    }, 0);
                }
            }
            return acc + val;
        }, 0);

        const totalExpense = allPurchases.reduce((acc: number, curr: any) => {
            // Cek Header
            let val = Number(curr.totalAmount) || Number(curr.total) || Number(curr.grandTotal) || Number(curr.amount) || 0;

            // Fallback: Hitung dari Items
            if (val === 0) {
                const items = curr.RFQItems || curr.items || [];
                if (Array.isArray(items)) {
                    val = items.reduce((sum: number, it: any) => {
                        const qty = Number(it.quantity || it.qty || 0);
                        const cost = Number(it.unitPrice || it.price || it.cost || it.amount || 0);
                        return sum + (qty * cost);
                    }, 0);
                }
            }
            return acc + val;
        }, 0);

        setFinance({
            income: totalIncome,
            expense: totalExpense,
            profit: totalIncome - totalExpense
        });

        // 4. Update Stats Lainnya (Low Stock & Total Count)
        // Saya ubah label category jadi bahasa Indonesia di sini
        const lowStockProd = allProducts.filter(p => Number(p.quantity || 0) < 10).map(p => ({...p, category: 'Barang Jadi'}));
        const lowStockMat = allMaterials.filter(m => Number(m.weight || 0) < 500).map(m => ({...m, category: 'Bahan Baku'})); 
        
        setStats({
          totalProducts: allProducts.length,
          totalMaterials: allMaterials.length,
          totalValue: prodValue + matValue,
          lowStockCount: lowStockProd.length + lowStockMat.length
        })

        setLowStockItems([...lowStockProd, ...lowStockMat].slice(0, 5)); 
        setRecentItems([...allProducts.slice(0, 3), ...allMaterials.slice(0, 2)]);

      } catch (e) {
        console.error("Dashboard Error", e)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="bg-purple-600/20 text-purple-400 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </span>
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-12">
            Selamat Datang!!
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-[#161b22] px-4 py-2 rounded-full border border-gray-800 capitalize">
           {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Produk */}
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Produk</p>
          <h3 className="text-3xl font-bold text-white mt-2">{loading ? "..." : stats.totalProducts}</h3>
          <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Barang Jadi
          </p>
        </div>

        {/* Card 2: Total Material */}
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v19"/><path d="M5 10h14"/><path d="M5 15h14"/></svg>
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Bahan Baku</p>
          <h3 className="text-3xl font-bold text-white mt-2">{loading ? "..." : stats.totalMaterials}</h3>
          <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span> Komponen & Material
          </p>
        </div>

        {/* Card 3: Inventory Value */}
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Nilai Aset</p>
          <h3 className="text-2xl font-bold text-white mt-2">{loading ? "..." : formatRupiah(stats.totalValue)}</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Estimasi Valuasi
          </p>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-gradient-to-br from-[#161b22] to-red-900/10 border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Perlu Perhatian</p>
          <h3 className="text-3xl font-bold text-white mt-2">{loading ? "..." : stats.lowStockCount}</h3>
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Item Stok Menipis
          </p>
        </div>
      </div>

      {/* === CONTENT SPLIT === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: FINANCE & QUICK ACTIONS */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* === FINANCIAL OVERVIEW === */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Finance
                    </h3>
                    <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">Estimasi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Income */}
                    <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Pendapatan</p>
                        <p className="text-xl font-bold text-emerald-400">{loading ? "..." : formatRupiah(finance.income)}</p>
                    </div>
                    {/* Expense */}
                    <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Pengeluaran</p>
                        <p className="text-xl font-bold text-red-400">{loading ? "..." : formatRupiah(finance.expense)}</p>
                    </div>
                    {/* Profit */}
                    <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Laba Bersih</p>
                        <p className={`text-xl font-bold ${finance.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                            {loading ? "..." : formatRupiah(finance.profit)}
                        </p>
                    </div>
                </div>

                {/* Visual Bar Graph */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Rasio Pemasukan vs Pengeluaran</span>
                        <span>{finance.income > 0 ? ((finance.profit / finance.income) * 100).toFixed(1) : 0}% Margin</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                        <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${finance.income > 0 ? (finance.profit / finance.income) * 100 : 0}%` }}
                        ></div>
                        <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${finance.income > 0 ? (finance.expense / finance.income) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions

                </h3>
                <div className="flex flex-wrap gap-4">
                    <Link href="/products/create-product" className="flex-1 min-w-[150px] bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:text-blue-300 py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span className="font-semibold text-sm">Tambah Produk</span>
                    </Link>
                    <Link href="/products/create-material" className="flex-1 min-w-[150px] bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-400 hover:text-purple-300 py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        <span className="font-semibold text-sm">Tambah Material</span>
                    </Link>
                    <Link href="/inventory" className="flex-1 min-w-[150px] bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                        <span className="font-semibold text-sm">Lihat Inventory</span>
                    </Link>
                </div>
            </div>

            {/* Recent Items List */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Baru Ditambahkan</h3>
                    <Link href="/inventory" className="text-xs text-purple-400 hover:text-purple-300">Lihat Semua</Link>
                </div>
                
                <div className="space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                           {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>)}
                        </div>
                    ) : recentItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Belum ada item terbaru.</p>
                    ) : (
                        recentItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                           <img 
                                              src={getImageUrl(item, item.weight ? 'material' : 'product') || ""} 
                                              alt={item.name} 
                                              className="w-full h-full object-cover"
                                              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                           />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">{item.name}</h4>
                                        <p className="text-gray-500 text-xs">{item.internalReference || "No Ref"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">
                                        {item.weight ? `${item.weight} gr` : `${item.quantity} unit`}
                                    </p>
                                    <p className="text-xs text-gray-500">Stok</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ALERTS */}
        <div className="space-y-8">
             {/* Low Stock Warning */}
             <div className="bg-[#161b22] border border-red-900/30 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-2 mb-6 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <h3 className="text-lg font-bold">Peringatan Stok Rendah</h3>
                </div>

                <div className="space-y-3">
                    {loading ? (
                         <div className="animate-pulse space-y-2">
                            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded"></div>)}
                         </div>
                    ) : lowStockItems.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <p className="text-gray-400 text-sm">Semua level stok aman!</p>
                        </div>
                    ) : (
                        lowStockItems.map((item, idx) => (
                            <div key={idx} className="bg-red-900/10 border border-red-900/30 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-red-200 text-sm font-medium line-clamp-1">{item.name}</p>
                                    <p className="text-red-400/60 text-xs">{item.category}</p>
                                </div>
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {item.weight ? item.weight : item.quantity} tersisa
                                </span>
                            </div>
                        ))
                    )}
                </div>
                
                {lowStockItems.length > 0 && (
                    <button className="w-full mt-6 py-2 text-sm text-center text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors">
                        Kelola Stok Ulang
                    </button>
                )}
             </div>
        </div>

      </div>
    </section>
  )
}