"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// 1. Helper Format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// 2. Helper Format Tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });
};

// 3. Helper Warna Status (Invoice Specific)
const getStatusColor = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  switch (s) {
    case "paid": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "unpaid": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "overdue": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "draft": return "bg-gray-700 text-gray-300 border-gray-600";
    default: return "bg-gray-700 text-gray-300 border-gray-600";
  }
};

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/invoices");
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          setInvoices([]); 
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Invoices
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-11">
            Manage billing and track payments.
          </p>
        </div>

        <Link 
          href="/invoices/create" 
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Invoice
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

      {/* GRID CARDS LAYOUT */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <div 
              key={inv.id} 
              className="group relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Invoice No.</span>
                  <span className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    {inv.invoiceNumber}
                  </span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(inv.status)}`}>
                  {inv.status}
                </span>
              </div>

              {/* Card Body: Info */}
              <div className="mb-6 space-y-3">
                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Billed To</p>
                    <p className="text-sm font-medium text-gray-200 line-clamp-1">
                      {inv.Customer?.name || "Unknown Customer"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                   </div>
                   <div>
                      <p className="text-xs text-gray-500">Issued Date</p>
                      <p className="text-sm text-gray-200">
                         {formatDate(inv.createdAt)}
                      </p>
                   </div>
                </div>
              </div>

              {/* Card Footer: Total & Action */}
              <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grand Total</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatRupiah(inv.grandTotal)}
                  </p>
                </div>
                
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700"
                >
                  Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No invoices found</p>
          <p className="text-gray-600 text-sm mt-1">Create an invoice manually or from a Delivery Order.</p>
        </div>
      )}

    </section>
  );
}