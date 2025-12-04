"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 1. Helper Format Rupiah (Biar rapi)
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

// 2. Helper Format Tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });
};

export default function QuotationDetail({ params }: any) {
  const router = useRouter();
  const { id } = params;
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quotations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data);
        } else {
          console.error("Failed to load");
        }
      } catch (error) {
        console.error("Network error", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const convertToSalesOrder = async () => {
    if (!confirm("Are you sure you want to convert this to Sales Order?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/sales/from-quotation/${id}`, {
            method: "POST",
        });

        if (!res.ok) {
            const err = await res.text();
            return alert("❌ Failed: " + err);
        }

        alert("✔ Successfully converted to Sales Order!");
        router.push("/sales-orders"); // Redirect ke halaman Sales Order
    } catch (error) {
        alert("❌ Network Error");
    }
  };

  if (loading) return <p className="text-gray-400 p-10 text-center animate-pulse">Loading quotation data...</p>;
  if (!quotation) return <p className="text-red-400 p-10 text-center">Quotation not found.</p>;

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">
                {/* PERBAIKAN 1: Gunakan qtNumber */}
                {quotation.qtNumber}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
                Created on {formatDate(quotation.createdAt)}
            </p>
        </div>

        <div className="flex gap-3">
          {/* Tombol Convert hanya muncul jika status masih Draft/Sent */}
          {(quotation.status === "Draft" || quotation.status === "Sent") && (
            <button
              onClick={convertToSalesOrder}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all"
            >
              Convert to Sales Order
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-all"
          >
            Back
          </button>
        </div>
      </div>

      {/* INFO CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Customer */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-3">Customer Info</h3>
            <p className="text-lg font-medium text-white">{quotation.Customer?.name}</p>
            <p className="text-gray-400 text-sm">{quotation.Customer?.email}</p>
        </div>

        {/* Card 2: Details */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-3">Terms & Dates</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-white border border-gray-700">{quotation.status}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Valid Until:</span>
                    {/* PERBAIKAN: Tampilkan validUntil */}
                    <span className="text-white">{formatDate(quotation.validUntil)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Payment:</span>
                    <span className="text-white">{quotation.paymentTerms || "-"}</span>
                </div>
            </div>
        </div>

        {/* Card 3: Address */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-3">Delivery To</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
                {quotation.deliveryAddress || "No delivery address provided."}
            </p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
                <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {quotation.QuotationItems?.map((i: any) => (
                <tr key={i.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                        <p className="font-medium text-white">{i.Product?.name}</p>
                        <p className="text-xs text-gray-500">{i.description || "-"}</p>
                    </td>
                    <td className="p-4 text-center text-gray-300">{i.quantity}</td>
                    <td className="p-4 text-right text-gray-300">
                        {formatRupiah(i.unitPrice)}
                    </td>
                    <td className="p-4 text-right font-medium text-cyan-400">
                        {formatRupiah(i.subtotal)} {/* subtotal item dihitung di backend */}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* TOTAL SUMMARY */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3 bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-3">
            <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatRupiah(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
                <span>Tax (11%)</span>
                <span>{formatRupiah(quotation.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Grand Total</span>
                {/* PERBAIKAN 2: Gunakan grandTotal */}
                <span className="text-2xl font-bold text-green-400">
                    {formatRupiah(quotation.grandTotal)}
                </span>
            </div>
        </div>
      </div>

    </section>
  );
}