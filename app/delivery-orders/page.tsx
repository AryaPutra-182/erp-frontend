"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 1. Helper Format Tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// 2. Helper Warna Status (Logistik)
const getStatusColor = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  switch (s) {
    case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "shipped": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "delivered": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "returned": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-gray-700 text-gray-300 border-gray-600";
  }
};

export default function DeliveryOrderPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/delivery-orders");
        if (res.ok) setDeliveries(await res.json());
      } catch {
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Delivery Orders
          </h1>
        
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-900 rounded-xl border border-gray-800"></div>
          ))}
        </div>
      )}

      {/* GRID CARDS */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map((d) => (
            <div 
              key={d.id} 
              className="group relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50 flex flex-col justify-between"
            >
              {/* Card Header: Number & Status */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Delivery No.</span>
                  <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {d.deliveryNumber}
                  </span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(d.status)}`}>
                  {d.status}
                </span>
              </div>

              {/* Card Body: Customer */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Ship To</p>
                    <p className="text-base font-medium text-gray-200 line-clamp-1">
                      {d.Customer?.name || "Unknown Customer"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Date & Action */}
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Created Date</span>
                    <span className="text-sm text-gray-300 font-mono">
                        {formatDate(d.createdAt)}
                    </span>
                </div>

                <Link
                  href={`/delivery-orders/${d.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                >
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && deliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No deliveries found</p>
          <p className="text-gray-600 text-sm mt-1">Delivery orders generated from Sales Orders will appear here.</p>
        </div>
      )}
    </section>
  );
}