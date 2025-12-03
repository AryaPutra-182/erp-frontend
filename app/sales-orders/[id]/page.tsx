"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SalesDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/sales/${id}`)
      .then(res => res.json())
      .then(setOrder);
  }, []);

  if (!order) return <p className="text-white">Loading...</p>;

  // ACTION BUTTON FUNCTIONS
  const triggerAction = async (path: string) => {
    await fetch(`http://localhost:5000/api/sales/${id}/${path}`, {
      method: "POST",
    });
    location.reload();
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{order.soNumber}</h1>
      
      <div className="flex gap-2 mb-6">
        {order.status === "Draft" && (
          <button
            onClick={() => triggerAction("confirm")}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Confirm Order
          </button>
        )}

        {order.status === "Confirmed" && (
          <button
            onClick={() => triggerAction("delivery")}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Create Delivery
          </button>
        )}

        {order.status === "Delivered" && (
          <button
            onClick={() => triggerAction("invoice")}
            className="px-4 py-2 bg-yellow-600 rounded"
          >
            Create Invoice
          </button>
        )}
      </div>

      <p>Customer: {order.Customer?.name}</p>
      <p>Total: Rp {order.grandTotal}</p>

      <h2 className="text-xl mt-6 font-semibold">Items</h2>

      <table className="mt-2 w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Product</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((i: any) => (
            <tr key={i.id} className="border-b border-gray-700">
              <td className="p-2">{i.productName}</td>
              <td className="p-2">{i.quantity}</td>
              <td className="p-2 text-cyan-300">Rp {i.unitPrice}</td>
              <td className="p-2 text-green-400">Rp {i.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
