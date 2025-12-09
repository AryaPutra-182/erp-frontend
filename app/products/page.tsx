'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api' // Pastikan path ini benar

// GANTI DENGAN URL BACKEND KAMU
const API_BASE_URL = "http://localhost:5000";

type ItemType = 'product' | 'material';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ==== STATE UNTUK MODAL DELETE ====
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    id: number | null;
    type: ItemType | null;
    name: string;
  }>({
    open: false,
    id: null,
    type: null,
    name: '',
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, matRes] = await Promise.all([
          apiGet<any[]>('/inventory/products').catch((err) => {
            console.error("Gagal load produk:", err);
            return [];
          }),
          apiGet<any[]>('/materials').catch((err) => {
            console.error("Gagal load material:", err);
            return [];
          })
        ]);

        console.log("Products Loaded:", prodRes);
        setProducts(prodRes || []);
        setMaterials(matRes || []);
      } catch (e) {
        console.error("Error fetching data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. Helper URL Gambar ---
  const getImageUrl = (image: string, type: ItemType) => {
    if (!image) return null;
    const cleanPath = image.replace(/\\/g, "/");
    return type === 'material'
      ? `${API_BASE_URL}/uploads/${cleanPath}`
      : `${API_BASE_URL}/${cleanPath}`;
  }

  // --- 3a. BUKA MODAL KONFIRMASI DELETE ---
  const openConfirmDelete = (
    e: React.MouseEvent,
    id: number,
    type: ItemType,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmData({
      open: true,
      id,
      type,
      name,
    });
  };

  // --- 3b. EKSEKUSI DELETE SETELAH KONFIRMASI ---
  const handleConfirmDelete = async () => {
    if (!confirmData.id || !confirmData.type) return;

    try {
      setIsDeleting(true);

      const endpoint =
        confirmData.type === 'product'
          ? `${API_BASE_URL}/api/inventory/products/${confirmData.id}`
          : `${API_BASE_URL}/api/materials/${confirmData.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");

      if (confirmData.type === 'product') {
        setProducts(prev => prev.filter(item => item.id !== confirmData.id));
      } else {
        setMaterials(prev => prev.filter(item => item.id !== confirmData.id));
      }

      setConfirmData(prev => ({ ...prev, open: false }));
    } catch (err) {
      console.error(err);
      alert("Error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 4. Format Currency ---
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }

  if (loading) return (
    <div className="p-6">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-64 bg-gray-900 rounded-xl animate-pulse border border-gray-800"></div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </span>
            Inventory Items
          </h1>
          <p className="text-gray-400 text-sm mt-2 ml-1">Manage your products and raw materials.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/products/create-product" className="flex items-center gap-2 px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg transition-all shadow-lg shadow-green-900/20 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </Link>
          <Link href="/products/create-material" className="flex items-center gap-2 px-4 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Material
          </Link>
        </div>
      </div>

      {/* === PRODUCTS SECTION (Tetap Bisa Diedit / Link) === */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">Barang Jadi</h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400 border border-gray-700">{products.length} Items</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-[#161b22] border border-gray-800 border-dashed rounded-xl">
            <p className="text-gray-500">No products found. Start by adding one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <Link
                href={`/products/edit/${p.id}`}
                key={i}
                className="group relative bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 block"
              >
                {/* DELETE BUTTON PRODUCT */}
                <button
                  onClick={(e) => openConfirmDelete(e, p.id, 'product', p.name)}
                  className="absolute top-3 right-3 z-20 bg-gray-900/80 backdrop-blur text-red-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 border border-gray-700 hover:border-red-500"
                  title="Delete Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>

                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  {p.image ? (
                    <img
                      src={getImageUrl(p.image, 'product') || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={p.name}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-800/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-xs mt-2 font-medium">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-60"></div>
                </div>

                <div className="p-5 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-900/50">
                      {p.type || "Product"}
                    </span>
                    <p className="text-xs font-mono text-gray-500">{p.internalReference || "N/A"}</p>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-emerald-400 font-bold text-sm bg-emerald-900/10 inline-block px-2 py-1 rounded mt-2 border border-emerald-900/20">
                    {formatRupiah(p.salePrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* === MATERIALS SECTION (HANYA VIEW, TIDAK BISA EDIT) === */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">Raw Materials</h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400 border border-gray-700">{materials.length} Items</span>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-16 bg-[#161b22] border border-gray-800 border-dashed rounded-xl">
            <p className="text-gray-500">No materials found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((m, i) => (
              // PERUBAHAN: Ganti Link dengan div agar tidak bisa diklik (tidak masuk edit)
              <div
                key={i}
                className="group relative bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
              >

                {/* DELETE BUTTON (Tetap Bisa Hapus) */}
                <button
                  onClick={(e) => openConfirmDelete(e, m.id, 'material', m.name)}
                  className="absolute top-3 right-3 z-20 bg-gray-900/80 backdrop-blur text-red-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 border border-gray-700 hover:border-red-500 cursor-pointer"
                  title="Delete Material"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>

                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  {m.image ? (
                    <img
                      src={getImageUrl(m.image, 'material') || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={m.name}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-800/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      <span className="text-xs mt-2 font-medium">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-60"></div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded border border-purple-900/50">
                      {m.type || "Material"}
                    </span>
                    <p className="text-xs font-mono text-gray-500">{m.internalReference || "N/A"}</p>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                    {m.name}
                  </h3>

                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Cost</p>
                      <p className="text-gray-200 font-bold text-sm">
                        {formatRupiah(m.cost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-gray-200 font-bold text-sm">
                        {m.weight} gr
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==== MODAL KONFIRMASI DELETE ==== */}
      {confirmData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setConfirmData(prev => ({ ...prev, open: false }))}
          />
          <div className="relative bg-[#0D1117] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-lg font-semibold text-white mb-2">
              {confirmData.type === 'product' ? 'Hapus Produk?' : 'Hapus Material?'}
            </h3>
            <p className="text-sm text-gray-300 mb-5">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold">
                {confirmData.name}
              </span>
              ? <br />
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmData(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 transition text-sm disabled:opacity-60"
              >
                Tidak
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}