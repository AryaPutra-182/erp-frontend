"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuotationDetail({ params }: any) {
  const router = useRouter();
  const { id } = params;

  const [quotation, setQuotation] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      console.log("📡 Fetching:", `http://localhost:5000/api/quotations/${id}`);
      
      const res = await fetch(`http://localhost:5000/api/quotations/${id}`);

      console.log("📦 Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Quotation Loaded:", data);
        setQuotation(data);
      } else {
        console.error("❌ Failed Response:", await res.text());
      }
    };

    load();
  }, [id]);


  const convertToSalesOrder = async () => {
  console.log("🚀 Sending request:", `http://localhost:5000/api/sales/from-quotation/${id}`);

  const res = await fetch(`http://localhost:5000/api/sales/from-quotation/${id}`, {
    method: "POST",
  });

  console.log("📦 Response status:", res.status);

  if (!res.ok) {
    console.error("❌ Backend error:", await res.text());
    return alert("❌ Failed to convert — check backend log");
  }

  alert("✔ Successfully converted to Sales Order");
  router.push("/sales-orders");
};



  if (!quotation)
    return <p className="text-gray-400 p-6">Loading quotation...</p>;


  return (
    <section className="text-white p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{quotation.quotationNumber}</h1>

        <div className="flex gap-2">
          {quotation.status === "Draft" && (
            <button
              onClick={convertToSalesOrder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Convert to Sales Order
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg space-y-3">
        <p><strong>Customer:</strong> {quotation.Customer?.name}</p>
        <p><strong>Payment Terms:</strong> {quotation.paymentTerms}</p>
        <p><strong>Delivery Address:</strong> {quotation.deliveryAddress}</p>
      </div>


      {/* ITEMS */}
      <h2 className="mt-6 mb-2 text-lg font-semibold">Items</h2>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Product</th>
            <th className="p-2 w-20">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {quotation.QuotationItems.map((i: any) => (
            <tr key={i.id} className="border-b border-gray-700">
              <td className="p-2">{i.Product?.name}</td>
              <td className="p-2">{i.quantity}</td>
              <td className="p-2 text-cyan-300">Rp {i.unitPrice}</td>
              <td className="p-2 text-green-400 font-bold">
                Rp {i.subtotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* TOTAL SECTION */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg text-sm space-y-2">
        <p>Subtotal: <span className="text-cyan-300 font-semibold">Rp {quotation.subtotal}</span></p>
        <p>Tax (11%): <span className="text-yellow-300 font-semibold">Rp {quotation.taxAmount}</span></p>
        <p>Total: <span className="text-green-400 font-bold text-lg">Rp {quotation.totalAmount}</span></p>
      </div>

    </section>
  );
}
