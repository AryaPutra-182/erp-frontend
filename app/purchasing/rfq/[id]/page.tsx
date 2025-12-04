'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PurchaseDetail({ params }: any) {
  const { id } = params
  const router = useRouter()

  const [po, setPo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // --- HELPER FORMAT ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  }
  
  const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
  }

  const getStatusColor = (status: string) => {
      const s = String(status || "").toLowerCase();
      if(s === "done" || s === "received") return "text-emerald-400 bg-emerald-900/20 border-emerald-800";
      if(s === "purchase order") return "text-blue-400 bg-blue-900/20 border-blue-800";
      return "text-yellow-400 bg-yellow-900/20 border-yellow-800";
  }

  // --- FETCH DATA ---
  const fetchDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/purchasing/${id}`)
      if (res.ok) {
          const data = await res.json();
          // Cek apakah data dibungkus 'data' atau langsung object
          setPo(data.data || data); 
      } else {
          console.error("Failed to load PO");
          setPo(null);
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDetail() }, [id])

  // --- ACTION: RECEIVE PRODUCTS ---
  const handleReceive = async () => {
      if(!confirm("Terima barang dan update stok gudang?")) return;
      
      setProcessing(true);
      try {
          const res = await fetch(`http://localhost:5000/api/purchasing/${id}/receive`, {
              method: 'POST'
          });
          const data = await res.json();
          
          if(res.ok) {
              alert("✅ Stok Berhasil Ditambahkan ke Inventory!");
              fetchDetail(); // Refresh data
          } else {
              alert("❌ Gagal: " + (data.error || "Unknown Error"));
          }
      } catch(e) {
          alert("Network Error");
      } finally {
          setProcessing(false);
      }
  }

  if (loading) return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-gray-500">
          <span className="animate-pulse">Loading Purchase Order...</span>
      </div>
  );

  if (!po) return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-red-500">
          Order Not Found
      </div>
  );

  // LOGIC HITUNG TOTAL (ROBUST)
  const grandTotal = (po.RFQItems || po.items || []).reduce((acc: number, item: any) => {
      const qty = Number(item.qty || item.quantity || 0);
      const price = Number(item.price || item.unitPrice || 0);
      return acc + (qty * price);
  }, 0);

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      {/* HEADER & NAV */}
      <div className="max-w-5xl mx-auto mb-8">
         <div className="flex justify-between items-center mb-6">
            <Link href="/purchasing" className="text-sm text-gray-500 hover:text-white inline-flex items-center gap-1 transition">
                ← Back to List
            </Link>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight font-mono">{po.rfqNumber}</h1>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusColor(po.status)}`}>
                        {po.status}
                    </span>
                </div>
                <p className="text-gray-400 text-sm">Created on {formatDate(po.createdAt)}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
                {po.status !== "Done" && (
                    <button 
                        onClick={handleReceive}
                        disabled={processing}
                        className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {processing ? "Processing..." : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Receive Products
                            </>
                        )}
                    </button>
                )}
                <button className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition">
                    Print PDF
                </button>
            </div>
         </div>
      </div>

      {/* INFO CARDS */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Vendor Card */}
          <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl -mr-5 -mt-5"></div>
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Vendor Information</h3>
              <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8H7v8"/></svg>
                  </div>
                  <div>
                      <p className="text-lg font-bold text-white">{po.Vendor?.vendorName || "Unknown Vendor"}</p>
                      <p className="text-gray-400 text-sm mt-1">{po.Vendor?.email || "-"}</p>
                      <p className="text-gray-400 text-sm">{po.Vendor?.phone || "-"}</p>
                      <p className="text-gray-500 text-xs mt-2 italic">{po.Vendor?.address || "No Address"}</p>
                  </div>
              </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Shipping Details</h3>
              <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Scheduled Date</span>
                      <span className="text-white">{formatDate(po.expectedArrival)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Destination</span>
                      <span className="text-white">Main Warehouse</span>
                  </div>
                  <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Source Document</span>
                      <span className="text-blue-400 font-mono">{po.rfqNumber}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">Products</h3>
        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Unit Price</th>
                        <th className="p-4 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {po.RFQItems?.map((item: any, i: number) => {
                        const materialName = item.material?.name || item.Material?.name || `Material #${item.materialId}`;
                        
                        return (
                            <tr key={i} className="hover:bg-gray-800/30 transition">
                                <td className="p-4 font-medium text-white">
                                    {materialName}
                                </td>
                                <td className="p-4 text-center text-blue-300 font-mono">
                                    {item.qty}
                                </td>
                                <td className="p-4 text-right text-gray-400 font-mono">
                                    {formatRupiah(Number(item.price))}
                                </td>
                                <td className="p-4 text-right font-bold text-emerald-400 font-mono">
                                    {formatRupiah(Number(item.qty) * Number(item.price))}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot className="bg-gray-800/50 border-t border-gray-800">
                    <tr>
                        <td colSpan={3} className="p-4 text-right font-bold text-white uppercase text-xs">Total Amount</td>
                        <td className="p-4 text-right font-bold text-emerald-400 text-xl font-mono">
                            {formatRupiah(grandTotal)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>

    </section>
  )
}