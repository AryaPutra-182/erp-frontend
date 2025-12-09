"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // MODAL STATE
  const [modal, setModal] = useState({
    open: false,
    msg: "",
    onClose: () => {},
  });

  // OPEN MODAL
  const showModal = (msg: string, cb?: () => void) => {
    setModal({
      open: true,
      msg,
      onClose: cb || (() => {}),
    });
  };

  // 1. FETCH DELIVERY ORDERS
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/delivery-orders");
        const data = await res.json();

        if (Array.isArray(data)) {
          const readyToInvoice = data.filter((d: any) => d.status === "Delivered");
          setDeliveries(readyToInvoice);
        }
      } catch (error) {
        console.error("Failed to fetch DO", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // 2. HANDLE GENERATE
  const handleGenerate = async (deliveryId: number) => {
    setProcessingId(deliveryId);

    try {
      const res = await fetch(
        `http://localhost:5000/api/invoices/from-delivery/${deliveryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Jika invoice sudah ada
        if (data.error && data.error.includes("already exists")) {
          return showModal("Invoice for this delivery already exists.", () => {
            router.push("/invoices");
          });
        }

        return showModal(data.error || "Failed to create invoice");
      }

      // SUCCESS — SHOW MODAL
      showModal("Invoice Created Successfully!", () => {
        router.push(`/invoices/${data.invoice.id}`);
      });

    } catch (err: any) {
      showModal(err.message || "Unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading pending deliveries...</div>;

  return (
    <>
      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] text-white p-6 rounded-lg w-80 shadow-xl text-center">
            <p className="mb-4 whitespace-pre-line">{modal.msg}</p>
            <button
              onClick={() => {
                setModal({ ...modal, open: false });
                modal.onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <section className="p-6 max-w-7xl mx-auto text-white">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Orders to Invoice</h1>
            <p className="text-gray-400 mt-1">
              Select a completed delivery to generate an invoice.
            </p>
          </div>
          <Link
            href="/invoices"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            View All Invoices
          </Link>
        </div>

        {/* TABLE */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
              <tr>
                <th className="p-4">DO Number</th>
                <th className="p-4">Source Document</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Delivered</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {deliveries.length > 0 ? (
                deliveries.map((doItem: any) => (
                  <tr key={doItem.id} className="hover:bg-gray-800 transition">
                    <td className="p-4 font-bold text-blue-300">
                      {doItem.doNumber}
                    </td>
                    <td className="p-4 text-gray-400">
                      {doItem.salesOrder?.soNumber || "-"}
                    </td>
                    <td className="p-4">
                      {doItem.salesOrder?.Customer?.name ||
                        doItem.Customer?.name ||
                        "Unknown"}
                    </td>
                    <td className="p-4">
                      {doItem.updatedAt
                        ? new Date(doItem.updatedAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleGenerate(doItem.id)}
                        disabled={processingId === doItem.id}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-4 py-2 rounded text-xs font-bold shadow transition flex items-center justify-center gap-2 w-full md:w-auto mx-auto"
                      >
                        {processingId === doItem.id
                          ? "Processing..."
                          : "⚡ Generate Invoice"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <p className="text-lg">All caught up! 🎉</p>
                    <p className="text-sm mt-2">No pending deliveries to invoice.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
