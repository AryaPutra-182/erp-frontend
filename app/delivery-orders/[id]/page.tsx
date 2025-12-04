"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DeliveryOrderDetail({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Helper Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // 2. Helper Warna Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Partial": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Delivered": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Returned": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const fetchDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/delivery-orders/${id}`);
      if (!res.ok) throw new Error("Failed request");
      setDelivery(await res.json());
    } catch {
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ===== LOGIC ACTIONS (Sama seperti sebelumnya, hanya styling beda) =====
  
  const updateStatus = async () => {
    const next = delivery.status === "Pending" ? "Partial" : delivery.status === "Partial" ? "Delivered" : null;
    if (!next) return alert("✔ Already Delivered");

    const res = await fetch(`http://localhost:5000/api/delivery-orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) return alert("❌ Failed update");
    alert(`✔ Status Updated: ${next}`);
    fetchDetail();
  };

  const updateQty = async (item: any, value: number) => {
    if (value > item.quantityDemand) {
      alert("❌ Cannot exceed ordered quantity");
      return fetchDetail(); // Reset input
    }
    const res = await fetch(`http://localhost:5000/api/delivery-orders/item/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveredQty: value }),
    });
    if (!res.ok) return alert("❌ Failed update qty");
    fetchDetail();
  };

  const validateDelivery = async () => {
    const res = await fetch(`http://localhost:5000/api/delivery-orders/${id}/validate`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "❌ Failed to validate");
    alert("✔ Delivery Validated & Stock Updated");
    fetchDetail();
  };

  const createInvoice = async () => {
    if (!confirm("Create Invoice for this delivery?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/from-delivery/${id}`, { 
        method: "POST", headers: { "Content-Type": "application/json" } 
      });
      const responseText = await res.text(); 
      let data;
      try { data = JSON.parse(responseText); } catch { data = { error: responseText }; }

      if (!res.ok) throw new Error(data.error || "Failed creating invoice");
      alert("✔ Invoice Created Successfully!");
      router.push("/invoices"); 
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Delivery Data...</div>;
  if (!delivery) return <div className="p-10 text-center text-red-500">Delivery Order Not Found</div>;

  return (
    <section className="min-h-screen p-6 bg-[#0D1117] text-gray-200">
      
      {/* NAV & HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
             <Link href="/delivery-orders" className="text-sm text-gray-500 hover:text-white inline-flex items-center gap-1 transition">
                ← Back to List
             </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{delivery.deliveryNumber}</h1>
                    <span className={`px-3 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                    </span>
                </div>
                <p className="text-gray-400 text-sm">Created on {formatDate(delivery.createdAt)}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
                {delivery.status !== "Delivered" && (
                    <>
                        <button onClick={updateStatus} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 border border-gray-700 rounded-lg transition text-sm font-medium">
                            Mark as {delivery.status === "Pending" ? "Partial" : "Delivered"}
                        </button>
                        <button onClick={validateDelivery} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-900/20 transition text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Validate Stock
                        </button>
                    </>
                )}
                {delivery.status === "Delivered" && (
                    <button onClick={createInvoice} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-900/20 transition text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Create Invoice
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Card */}
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl">
             <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Ship To</h3>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                    <p className="text-lg font-bold text-white">{delivery.Customer?.name}</p>
                    <p className="text-gray-400 text-sm">{delivery.Customer?.email || "-"}</p>
                    <p className="text-gray-400 text-sm">{delivery.Customer?.phone || "-"}</p>
                </div>
             </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Delivery Details</h3>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ref Sales Order:</span>
                    <span className="text-blue-400 font-mono cursor-pointer hover:underline">
                        {delivery.salesOrder?.soNumber || "-"}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Address:</span>
                    <span className="text-gray-200 text-right max-w-[200px] truncate">
                        {delivery.salesOrder?.deliveryAddress || "Standard Delivery Address"}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Driver / Logistics:</span>
                    <span className="text-gray-200">-</span>
                </div>
            </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Items & Fulfillment
        </h2>

        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 bg-gray-800/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Ordered</div>
                <div className="col-span-3 text-center">Delivered (Input)</div>
                <div className="col-span-2 text-right">Remaining</div>
            </div>

            <div className="divide-y divide-gray-800">
                {delivery.items?.map((item: any) => {
                    const ordered = Number(item.quantityDemand || 0);
                    const delivered = Number(item.quantityDone || 0);
                    const remaining = ordered - delivered;
                    const progress = Math.min((delivered / ordered) * 100, 100);

                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/30 transition">
                            {/* Product Info */}
                            <div className="col-span-5">
                                <p className="font-bold text-white text-base">{item.Product?.name}</p>
                                <p className="text-gray-500 text-xs mt-0.5">SKU: {item.Product?.sku || "-"}</p>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${remaining === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Ordered */}
                            <div className="col-span-2 text-center">
                                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-md font-mono text-sm border border-gray-700">
                                    {ordered}
                                </span>
                            </div>

                            {/* Delivered Input */}
                            <div className="col-span-3 text-center">
                                {delivery.status === "Delivered" ? (
                                    <span className="font-bold text-emerald-400 text-lg">{delivered}</span>
                                ) : (
                                    <input
                                        type="number"
                                        min={0}
                                        max={ordered}
                                        defaultValue={delivered}
                                        onBlur={(e) => updateQty(item, Number(e.target.value))}
                                        className="w-24 bg-[#0D1117] border border-gray-600 text-white text-center rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                                    />
                                )}
                            </div>

                            {/* Remaining */}
                            <div className="col-span-2 text-right">
                                {remaining === 0 ? (
                                    <span className="text-emerald-500 font-bold text-sm flex items-center justify-end gap-1">
                                        ✔ Done
                                    </span>
                                ) : (
                                    <span className="text-yellow-500 font-bold font-mono">
                                        {remaining} left
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

    </section>
  );
}