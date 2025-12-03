"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  if (loading) return <p className="text-gray-400 p-6">Loading...</p>;

  return (
    <section className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Orders</h1>
      </div>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Delivery Number</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {deliveries.length > 0 ? (
            deliveries.map((d) => (
              <tr key={d.id} className="border-b border-gray-700">
                <td className="p-2">{d.deliveryNumber}</td>
                <td className="p-2">{d.Customer?.name}</td>
                <td className="p-2 text-yellow-400">{d.status}</td>
                <td className="p-2">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <Link
                    href={`/delivery-orders/${d.id}`}
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 p-5">
                No Delivery Orders yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
