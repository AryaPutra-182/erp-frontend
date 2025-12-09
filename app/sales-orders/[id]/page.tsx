"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SalesOrderDetail({ params }: any) {
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<{open:boolean; msg:string}>({
    open:false,
    msg:""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/sales/${id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setModal({open:true, msg:"Failed to load order"});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <p className="text-gray-400 p-6">Loading...</p>;
  if (!order) return <p className="text-red-400 p-6">Order not found</p>;

  const confirmOrder = async () => {
    const res = await fetch(`http://localhost:5000/api/sales/${id}/confirm`, {
      method: "POST",
    });

    if (!res.ok){
      setModal({open:true, msg:"Failed confirming order"});
      return;
    }

    setModal({open:true, msg:"Order Confirmed & Stock Updated"});
    setOrder({ ...order, status: "Confirmed" });
  };

  const createDO = async () => {
    const res = await fetch(`http://localhost:5000/api/delivery-orders/create-from-sales/${id}`, {
      method: "POST"
    });

    const data = await res.json();

    if (!res.ok){
      setModal({open:true, msg:data.error || "Failed"});
      return;
    }
    
    setModal({open:true, msg:"Delivery Order created!"});
    setTimeout(()=>router.push("/delivery-orders"), 900);
  };

  return (
    <section className="text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{order.soNumber}</h1>

        {order.status === "Draft" ? (
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            onClick={confirmOrder}
          >
            Confirm
          </button>
        ) : (
          <span className="text-green-400 font-semibold text-sm bg-green-900 px-3 py-1 rounded">
            ✔ Confirmed
          </span>
        )}

        {order.status === "Confirmed" && (
          <button
            onClick={createDO}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Create Delivery Order
          </button>
        )}

      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700 space-y-2">
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment:</strong> {order.paymentStatus}</p>
        <p>
          <strong>Total:</strong> Rp {Number(order.grandTotal).toLocaleString("id-ID")}
        </p>
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Items</h2>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Product</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="p-2">{item?.Product?.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">
                  Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                </td>
                <td className="p-2 text-green-400 font-bold">
                  Rp {Number(item.subtotal).toLocaleString("id-ID")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 p-4">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setModal({open:false, msg:""})}/>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Info</h3>
            <p className="text-sm text-gray-300 mb-5">{modal.msg}</p>
            <div className="flex justify-end">
              <button
                onClick={()=>setModal({open:false, msg:""})}
                className="px-4 py-2 bg-gray-800 rounded-lg text-white"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
