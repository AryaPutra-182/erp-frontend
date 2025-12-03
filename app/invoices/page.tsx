"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/invoices");
        const data = await res.json();

        console.log("DATA DARI BACKEND:", data); 

        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          console.error("Data bukan array:", data);
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

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <section className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">Invoices</h1>
  
  {/* Tambahkan Tombol Ini */}
  <Link 
    href="/invoices/create" 
    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
  >
    + Create Invoice
  </Link>
</div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
            <tr>
              <th className="p-4">Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {invoices.length > 0 ? (
              invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-800 transition">
                  <td className="p-4 font-bold">{inv.invoiceNumber}</td>
                  
                  {/* Customer Name */}
                  <td className="p-4">{inv.Customer?.name || "Unknown"}</td>
                  
                  {/* Date */}
                  <td className="p-4 text-gray-400">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  
                  {/* 👇 PERBAIKAN DI SINI: Gunakan inv.grandTotal */}
                  <td className="p-4 font-mono text-green-400 font-bold">
                    Rp {Number(inv.grandTotal).toLocaleString("id-ID")}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        inv.status === "Paid"
                          ? "bg-green-600 text-green-100"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="p-4 text-right">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}