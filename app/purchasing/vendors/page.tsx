import Link from 'next/link';
import { apiGet } from '../../lib/api';
import { Vendor } from '../../../types';

export default async function VendorsPage() {
  // --- LOGIKA CODING TETAP SAMA ---
  let vendors: Vendor[] = [];

  try { 
    vendors = await apiGet<Vendor[]>('/vendor'); 
  } catch (e) { 
    vendors = []; 
  }
  // --------------------------------

  return (
    <section className="p-6 max-w-7xl mx-auto min-h-screen">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        
        <div className="space-y-1">
          {/* 1. TOMBOL KEMBALI (Navigasi) */}
          <Link 
            href="/purchasing" 
            className="inline-flex items-center text-gray-400 hover:text-white transition text-sm mb-2 group"
          >
            <span className="mr-1 group-hover:-translate-x-1 transition-transform">←</span> 
            Back
          </Link>
          
          <h1 className="text-3xl font-bold text-white tracking-tight">Vendor Management</h1>
          <p className="text-gray-400 text-sm">Manage suppliers and partnership contacts.</p>
        </div>
      
        <Link
          href="/purchasing/vendors/create"
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-green-900/20 transition-all hover:scale-105 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Create New
        </Link>
      </div>

      {/* VENDOR GRID (Desain Baru) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {vendors.map(v => (
          <div 
            key={v.id}
            className="group bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Dekorasi Background Halus */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-cyan-500/10 transition"></div>

            <div className="flex items-start gap-4 z-10">
              {/* Image Avatar */}
              <div className="w-14 h-14 flex-shrink-0 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-sm">
                <img
                  src={
                    v.image
                      // Menambahkan replace agar aman dari backslash Windows, tapi logika path tetap sama
                      ? `http://localhost:5000/uploads/${v.image.replace(/\\/g, "/")}`
                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  alt={v.vendorName}
                />
              </div>

              {/* Name & Label */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg leading-tight truncate group-hover:text-cyan-400 transition">
                  {v.vendorName}
                </h3>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">
                  Supplier
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 w-full"></div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <span className="text-gray-600 mt-0.5">📍</span>
                <p className="line-clamp-2 text-xs leading-relaxed">
                  {v.address || "No address provided"}
                </p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <span className="text-gray-600">✉️</span>
                <p className="truncate text-xs text-cyan-200/80 hover:text-cyan-300 cursor-pointer">
                  {v.email || "No email"}
                </p>
              </div>
            </div>

          </div>
        ))}

        {/* Empty State (Jika tidak ada data) */}
        {vendors.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="mb-2 text-4xl">📭</p>
            <p>No vendors found.</p>
          </div>
        )}

      </div>

    </section>
  );
}