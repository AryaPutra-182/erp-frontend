"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Helper untuk format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk warna status
const getStatusColor = (status: string) => {
  const safeStatus = status ? status.toLowerCase() : "";
  
  switch (safeStatus) {
    case "approved": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "converted": return "bg-green-500/10 text-green-400 border-green-500/20"; // Tambahan status 'Converted'
    case "sent": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "draft": return "bg-gray-700 text-gray-300 border-gray-600";
    case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-gray-700 text-gray-300 border-gray-600";
  }
};

export default function QuotationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/quotations");
        if (res.ok) {
          const data = await res.json();
          console.log("Data Quotation:", data); // Debugging
          setRows(data);
        }
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          
        </div>
        
        <Link
          href="/quotations/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Create New
        </Link>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-900 rounded-xl border border-gray-800"></div>
          ))}
        </div>
      )}

      {/* CARD GRID LAYOUT */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((q) => {
            
            // PERBAIKAN LOGIC DATA DI SINI:
            // 1. Gunakan grandTotal dari DB (karena sudah termasuk pajak & presisi)
            // 2. Fallback ke hitung manual hanya jika grandTotal 0/null
            let displayTotal = Number(q.grandTotal);
            
            // Jika DB lama belum punya grandTotal, hitung manual dari QuotationItems (Bukan RFQItems!)
            if (!displayTotal && q.QuotationItems) {
                const subtotal = q.QuotationItems.reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
                displayTotal = subtotal * 1.11; // Tambah PPN 11% manual
            }

            return (
              <div 
                key={q.id} 
                className="group relative bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Quotation No.</span>
                    <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {/* PERBAIKAN: Gunakan qtNumber sesuai controller */}
                      {q.qtNumber || q.quotationNumber || "NO-NUMBER"} 
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(q.status)}`}>
                    {q.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Customer</p>
                      <p className="text-base font-medium text-gray-200 line-clamp-1">
                        {q.Customer?.name || "Unknown Customer"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Total & Action */}
                <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Grand Total</p>
                    <p className="text-xl font-bold text-cyan-400">
                      {formatRupiah(displayTotal || 0)}
                    </p>
                  </div>
                  
                  <Link
                    href={`/quotations/${q.id}`}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && rows.length === 0 && (
        <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
          <p className="text-gray-500 text-lg">No quotations found.</p>
          <p className="text-gray-600 text-sm">Create a new one to get started.</p>
        </div>
      )}
    </section>
  );
}