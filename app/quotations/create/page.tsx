"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateQuotation() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [mainItems, setMainItems] = useState<any[]>([]);
  const [optionalItems, setOptionalItems] = useState<any[]>([]);

  const [form, setForm] = useState({
    customerId: "",
    templateId: "",
    deliveryAddress: "",
    invoiceAddress: "",
    paymentTerms: "",
  });

  // Calculate totals live
  const calculateSubtotal = () =>
    mainItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const tax = calculateSubtotal() * 0.11;
  const total = calculateSubtotal() + tax;

  // Fetch dropdown data
  useEffect(() => {
    const load = async () => {
      try {
        const resCust = await fetch("http://localhost:5000/api/customers");
        if (resCust.ok) setCustomers(await resCust.json());
      } catch {}

      try {
        const resProducts = await fetch("http://localhost:5000/api/inventory/products");
        if (resProducts.ok) setProducts(await resProducts.json());
      } catch {}

      try {
        const resTemplates = await fetch("http://localhost:5000/api/quotations/templates");
        if (resTemplates.ok) setTemplates(await resTemplates.json());
      } catch {}
    };

    load();
  }, []);

  const addMainItem = () => {
    setMainItems([...mainItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const addOptionalItem = () => {
    setOptionalItems([...optionalItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (list: any[], setList: any, index: number, field: string, value: any) => {
    const updated = [...list];

    if (field === "productId") {
      const p = products.find((x: any) => x.id == value);
      updated[index] = {
        ...updated[index],
        productId: value,
        unitPrice: p?.salePrice || 0,
        description: p?.name,
      };
    } else {
      updated[index][field] = value;
    }

    setList(updated);
  };

  const removeItem = (list: any[], set: any, i: number) => {
    set(list.filter((_, idx) => idx !== i));
  };

  const submitForm = async () => {
    if (!form.customerId) return alert("Customer harus dipilih!");

    const payload = {
      ...form,
      customerId: Number(form.customerId),
      templateId: form.templateId ? Number(form.templateId) : null,
      mainItems,
      optionalItems
    };

    const res = await fetch("http://localhost:5000/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return alert("❌ Gagal membuat quotation");

    alert("✔ Quotation berhasil dibuat");
    router.push("/quotations");
  };

  return (
    <section className="text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Quotation</h1>
        <button
          onClick={submitForm}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Save
        </button>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-5">

        {/* CUSTOMER */}
        <div>
          <label className="block text-sm mb-2">Customer *</label>
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* TEMPLATE */}
        <div>
          <label className="block text-sm mb-2">Quotation Template</label>
          <select
            value={form.templateId}
            onChange={(e) => setForm({ ...form, templateId: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          >
            <option value="">-- None --</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.templateName}</option>)}
          </select>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4">
          <textarea placeholder="Delivery Address" className="bg-gray-800 p-2 border rounded"
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
          />
          <textarea placeholder="Invoice Address" className="bg-gray-800 p-2 border rounded"
            onChange={(e) => setForm({ ...form, invoiceAddress: e.target.value })}
          />
        </div>

        {/* MAIN TABLE */}
        <h2 className="text-lg font-semibold">Main Items</h2>

        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price</th>
              <th className="p-2">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mainItems.map((i, idx) => (
              <tr key={idx} className="border-b border-gray-700">
                <td className="p-2">
                  <select
                    className="w-full bg-gray-800 p-2 rounded border"
                    value={i.productId}
                    onChange={(e) => updateItem(mainItems, setMainItems, idx, "productId", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="p-2 w-16">
                  <input type="number" value={i.quantity} min={1}
                    className="w-full bg-gray-800 border rounded p-2"
                    onChange={(e) => updateItem(mainItems, setMainItems, idx, "quantity", Number(e.target.value))}
                  />
                </td>
                <td className="p-2">Rp {i.unitPrice}</td>
                <td className="p-2 text-cyan-400 font-bold">Rp {i.unitPrice * i.quantity}</td>
                <td className="p-2">
                  <button className="text-red-400"
                    onClick={() => removeItem(mainItems, setMainItems, idx)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="bg-blue-600 px-3 py-2 rounded" onClick={addMainItem}>+ Add Item</button>

        {/* TOTALS */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p>Subtotal: <span className="font-bold text-cyan-300">Rp {calculateSubtotal()}</span></p>
          <p>Tax (11%): <span className="font-bold text-yellow-300">Rp {tax.toFixed(0)}</span></p>
          <p>Total: <span className="font-bold text-green-400">Rp {total.toFixed(0)}</span></p>
        </div>
      </div>
    </section>
  );
}
