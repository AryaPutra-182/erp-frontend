"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryOrderDetail({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (!delivery) return <p className="p-6 text-red-400">Not Found</p>;

  // ===== STATUS LOGIC =====
  const updateStatus = async () => {
    const next =
      delivery.status === "Pending"
        ? "Partial"
        : delivery.status === "Partial"
        ? "Delivered"
        : null;

    if (!next) return alert("✔ Already Delivered");

    const res = await fetch(
      `http://localhost:5000/api/delivery-orders/${id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      }
    );

    if (!res.ok) return alert("❌ Failed update");
    alert(`✔ Status Updated: ${next}`);
    fetchDetail();
  };

  // ===== QTY UPDATE =====
  const updateQty = async (item: any, value: number) => {
    if (value > item.quantityDemand) {
      alert("❌ Cannot exceed ordered quantity");
      return fetchDetail();
    }

    const res = await fetch(
      `http://localhost:5000/api/delivery-orders/item/${item.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveredQty: value }),
      }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.error || "❌ Failed update qty");

    fetchDetail();
  };

  // ===== VALIDATE =====
  const validateDelivery = async () => {
    const res = await fetch(
      `http://localhost:5000/api/delivery-orders/${id}/validate`,
      { method: "POST" }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.error || "❌ Failed to validate");

    alert("✔ Delivery Validated & Stock Updated");
    fetchDetail();
  };

  // ===== CREATE INVOICE =====
  const createInvoice = async () => {
    if (!confirm("Create Invoice for this delivery?")) return;

    try {
      console.log("Mengirim request ke ID:", id); // Cek apakah ID ada?

      const res = await fetch(
        `http://localhost:5000/api/invoices/from-delivery/${id}`, 
        { 
            method: "POST",
            headers: { "Content-Type": "application/json" } // Tambahkan ini biar aman
        }
      );

      // BACA PESAN ERROR DARI BACKEND
      const responseText = await res.text(); 
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        data = { error: responseText }; // Kalau bukan JSON (misal HTML error)
      }

      console.log("Response Backend:", data); // <--- LIHAT INI DI CONSOLE

      if (!res.ok) throw new Error(data.error || "Failed creating invoice");

      alert("✔ Invoice Created Successfully!");
      router.push("/invoices"); 

    } catch (err: any) {
      console.error(err);
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <section className="p-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{delivery.deliveryNumber}</h1>

        <div className="flex gap-3">
          
          {/* KELOMPOK 1: Tombol Proses (Hanya muncul jika BELUM Delivered) */}
          {delivery.status !== "Delivered" && (
            <>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                onClick={updateStatus}
              >
                Next → {delivery.status === "Pending" ? "Partial" : "Delivered"}
              </button>

              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                onClick={validateDelivery}
              >
                ✅ Validate Delivery
              </button>
            </>
          )}

          {/* KELOMPOK 2: Tombol Invoice (Hanya muncul jika SUDAH Delivered) */}
          {/* Logika: Invoice biasanya dibuat setelah barang diterima (Delivered) */}
          {delivery.status === "Delivered" && (
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold shadow-lg flex items-center gap-2"
              onClick={createInvoice}
            >
              💰 Create Invoice
            </button>
          )}

        </div>
      </div>

      {/* INFO */}
      <div className="p-4 mb-6 space-y-2 bg-gray-900 border border-gray-700 rounded">
        <p>
          <strong>Status:</strong>{" "}
          <span className="text-yellow-300">{delivery.status}</span>
        </p>
        <p>
          <strong>Customer:</strong> {delivery.Customer?.name}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(delivery.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* ITEMS */}
      <h2 className="mb-2 text-lg font-semibold">Items</h2>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Product</th>
            <th className="p-2">Ordered</th>
            <th className="p-2">Delivered</th>
            <th className="p-2">Remaining</th>
          </tr>
        </thead>

        <tbody>
          {delivery.items?.map((item: any) => {
            const ordered = Number(item.quantityDemand || 0);
            const delivered = Number(item.quantityDone || 0);
            const remaining = ordered - delivered;

            return (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="p-2">{item.Product?.name}</td>
                <td className="p-2 text-blue-300">{ordered}</td>

                <td className="p-2">
                  {delivery.status === "Delivered" ? (
                    <span className="font-bold text-green-400">{delivered}</span>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={ordered}
                      defaultValue={delivered}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                      onBlur={(e) => updateQty(item, Number(e.target.value))}
                    />
                  )}
                </td>

                <td className="p-2 text-yellow-300">{remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
