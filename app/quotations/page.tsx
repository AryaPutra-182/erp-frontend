"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuotationsPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:5000/api/quotations");
      if (res.ok) setRows(await res.json());
    };
    fetchData();
  }, []);

  return (
    <section className="text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <Link
          href="/quotations/create"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          + Create Quotation
        </Link>
      </div>

      {/* LIST */}
      <div className="overflow-auto bg-gray-900 p-5 rounded-lg border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3">Number</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr
                key={q.id}
                className="border-b border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">{q.quotationNumber}</td>
                <td className="p-3">{q.Customer?.name}</td>
                <td className="p-3 text-cyan-300 font-semibold">Rp {q.total}</td>
                <td className="p-3">
                  <span className="px-2 py-1 text-sm rounded bg-gray-700">
                    {q.status}
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/quotations/${q.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
