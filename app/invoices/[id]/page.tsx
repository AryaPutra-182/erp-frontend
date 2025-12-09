"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceDetail({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // MODAL CONFIRM (untuk mengganti confirm bawaan browser)
  const [confirmPay, setConfirmPay] = useState(false);

  // MODAL INFO
  const [modal, setModal] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // FETCH DETAIL
  const fetchDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`);
      if (!res.ok) throw new Error("Not Found");
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // HANDLE PAYMENT (tanpa confirm bawaan browser)
  const handlePayment = async () => {
    setPaying(true);

    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}/pay`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to update payment");

      setModal({ open: true, msg: "✔ Payment Registered Successfully!" });
      fetchDetail();
    } catch (err: any) {
      setModal({ open: true, msg: "❌ " + err.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Invoice...</div>;
  if (!invoice) return <div className="p-8 text-red-500">Invoice not found.</div>;

  return (
    <section className="min-h-screen p-8 text-gray-900 bg-gray-100 print:bg-white print:p-0">

      {/* MAIN PAPER */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 print:shadow-none print:w-full">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-wide">INVOICE</h1>
            <p className="text-gray-500 mt-1 font-mono">#{invoice.invoiceNumber}</p>

            <div className="mt-4">
              <span
                className={`px-4 py-2 rounded text-sm font-bold border ${
                  invoice.status === "Paid"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="text-right space-y-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-semibold mr-2 transition"
            >
              🖨 Print
            </button>

            {invoice.status !== "Paid" && (
              <button
                onClick={() => setConfirmPay(true)}
                disabled={paying}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold shadow disabled:bg-gray-400 transition"
              >
                {paying ? "Processing..." : "💳 Register Payment"}
              </button>
            )}

            <button
              onClick={() => router.back()}
              className="block mt-4 text-sm text-gray-500 hover:underline"
            >
              &larr; Back to List
            </button>
          </div>
        </div>

        {/* INFO BLOCKS */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-400 font-bold uppercase text-xs mb-2">From:</h3>
            <p className="font-bold text-lg">PT. MAJU MUNDUR</p>
            <p className="text-gray-600 text-sm">Jl. Teknologi No. 10</p>
            <p className="text-gray-600 text-sm">Jakarta Selatan, 12345</p>
            <p className="text-gray-600 text-sm">finance@company.com</p>
          </div>

          <div className="text-right">
            <h3 className="text-gray-400 font-bold uppercase text-xs mb-2">Bill To:</h3>
            <p className="font-bold text-lg">{invoice.Customer?.name || "Unknown"}</p>
            <p className="text-gray-600 text-sm">{invoice.Customer?.address || "-"}</p>
            <p className="text-gray-600 text-sm">{invoice.Customer?.email || "-"}</p>

            <div className="mt-6 space-y-1">
              <div className="flex justify-end gap-4">
                <span className="text-gray-500 font-bold text-xs uppercase w-24">Date:</span>
                <span className="font-medium text-sm w-32">
                  {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>

              <div className="flex justify-end gap-4">
                <span className="text-gray-500 font-bold text-xs uppercase w-24">Due Date:</span>
                <span className="font-medium text-sm w-32">
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>

              <div className="flex justify-end gap-4">
                <span className="text-gray-500 font-bold text-xs uppercase w-24">Source DO:</span>
                <span className="font-medium text-sm w-32">
                  {invoice.deliveryOrder?.doNumber || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs text-left">
                <th className="p-3 border-b font-bold">Item Description</th>
                <th className="p-3 border-b text-center font-bold">Qty</th>
                <th className="p-3 border-b text-right font-bold">Unit Price</th>
                <th className="p-3 border-b text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-bold text-gray-800">{item.Product?.name || "Deleted Item"}</p>
                    <p className="text-xs text-gray-500">{item.Product?.code}</p>
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right text-gray-600">
                    Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900">
                    Rp {Number(item.subtotal).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Subtotal</span>
              <span>Rp {Number(invoice.total).toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Tax (11%)</span>
              <span>Rp {Number(invoice.tax).toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between border-t border-gray-300 pt-4 mt-2">
              <span className="font-bold text-xl text-gray-800">Grand Total</span>
              <span className="font-bold text-xl text-blue-600">
                Rp {Number(invoice.grandTotal).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center text-gray-500 text-xs border-t pt-8 print:mt-24">
          <p className="font-bold mb-1">Payment Instructions</p>
          <p>Please transfer to BCA 123-456-7890 a/n PT. MAJU MUNDUR</p>
          <p>Include Invoice Number in transfer description.</p>
          <p className="mt-4 italic">Thank you for your business!</p>
        </div>
      </div>

      {/* MODAL CONFIRM PAY */}
      {confirmPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirmPay(false)}
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Confirm Payment</h3>
            <p className="text-gray-600 mb-5">Mark this invoice as PAID?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPay(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmPay(false);
                  handlePayment();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Yes, Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModal({ open: false, msg: "" })}
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Info</h3>
            <p className="text-gray-600 mb-5">{modal.msg}</p>
            <div className="text-right">
              <button
                onClick={() => setModal({ open: false, msg: "" })}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
