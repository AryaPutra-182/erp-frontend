"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// 1. Helper Format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// 2. Helper Warna Status
const getStatusColor = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  switch (s) {
    case "confirmed": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "shipped": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "draft": return "bg-gray-700 text-gray-300 border-gray-600";
    default: return "bg-gray-700 text-gray-300 border-gray-600";
  }
};

export default function SalesOrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sales");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch sales orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor and manage your confirmed sales.
          </p>
        </div>

        <Link
          href="/sales-orders/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-green-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Create Sales Order
        </Link>
      </div>

      {/* LOADING STATE (Skeleton) */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-900 rounded-xl border border-gray-800"></div>
          ))}
        </div>
      )}

      {/* GRID CARDS LAYOUT */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => (
            <div 
              key={o.id} 
              className="group relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50 flex flex-col justify-between"
            >
              {/* Card Header: SO Number & Status */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">SO Number</span>
                  <span className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                    {o.soNumber || "SO-XXXX"}
                  </span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(o.status)}`}>
                  {o.status}
                </span>
              </div>

              {/* Card Body: Customer Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                    <p className="text-base font-medium text-gray-200 line-clamp-1">
                      {o.Customer?.name || "Unknown Customer"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Total & Action Button */}
              <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grand Total</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatRupiah(o.grandTotal)}
                  </p>
                </div>

                <Link
                  href={`/sales-orders/${o.id}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700"
                >
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No sales orders found</p>
          <p className="text-gray-600 text-sm mt-1">Start by creating a new sales order manually or converting a quotation.</p>
        </div>
      )}

    </section>
  );
}