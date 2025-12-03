"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSalesOrder() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [form, setForm] = useState({
    customerId: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  // Fetch dropdown data
  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then(res => res.json())
      .then(setCustomers);

    fetch("http://localhost:5000/api/inventory/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  // Add product to list
  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  // Update row state
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];

    if (field === "productId") {
      const product = products.find((p: any) => p.id == value);
      newItems[index].productId = value;
      newItems[index].unitPrice = product?.salePrice || 0;
      newItems[index].description = product?.name || "";
    } else {
      newItems[index][field] = value;
    }

    setItems(newItems);
  };

  // Remove item
  const removeItem = (i: number) => {
    setItems(items.filter((_, index) => index !== i));
  };

  // Submit Sales Order
  const submitForm = async () => {
    if (!form.customerId) return alert("Customer Cannot Be Empty");
    if (items.length === 0) return alert("Add at least one item");

    const res = await fetch("http://localhost:5000/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });

    if (!res.ok) return alert("Failed creating sales order");

    alert("Sales Order Created");
    router.push("/sales-orders");
  };

  return (
    <section className="text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Sales Order</h1>

        <button
          onClick={submitForm}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Save
        </button>
      </div>

      {/* FORM */}
      <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 space-y-5">

        {/* CUSTOMER */}
        <div>
          <label className="block text-sm mb-2">Customer *</label>
          <select
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* DATE */}
        <div>
          <label className="block text-sm mb-2">Transaction Date</label>
          <input
            type="date"
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            value={form.transactionDate}
            onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
          />
        </div>

        {/* PRODUCT TABLE */}
        <h2 className="text-lg font-semibold mt-6">Order Lines</h2>

        <table className="w-full text-white border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Unit Price</th>
              <th className="p-2">Subtotal</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-2">
                  <select
                    className="bg-gray-800 border-gray-600 p-2 rounded w-full"
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 w-[80px]">
                  <input
                    type="number"
                    className="bg-gray-800 border border-gray-600 p-2 rounded w-full"
                    value={item.quantity}
                    min={1}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  />
                </td>

                <td className="p-2">{item.unitPrice}</td>
                <td className="p-2 text-cyan-400">
                  Rp {item.unitPrice * item.quantity}
                </td>

                <td className="p-2">
                  <button
                    onClick={() => removeItem(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          onClick={addItem}
        >
          + Add Line
        </button>
      </div>
    </section>
  );
}
