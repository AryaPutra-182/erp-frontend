"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SalesOrderPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/sales")
      .then(res => res.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <section className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>

        <Link
          href="/sales-orders/create"
          className="px-3 py-2 bg-green-600 rounded text-white hover:bg-green-700"
        >
          + Create Sales Order
        </Link>
      </div>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">SO Number</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-b border-gray-700">
              <td className="p-2">{o.soNumber}</td>
              <td className="p-2">{o.Customer?.name}</td>
              <td className="p-2 text-cyan-400">Rp {o.grandTotal}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">
                <Link
                  href={`/sales-orders/${o.id}`}
                  className="text-blue-400 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
