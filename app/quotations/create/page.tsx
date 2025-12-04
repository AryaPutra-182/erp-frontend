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
    validUntil: "", // <--- 1. TAMBAHKAN INI
  });

  // Helper Format Rupiah
  const fmt = (n: number) => n.toLocaleString("id-ID");

  // Calculate totals (Hanya Main Items yang masuk ke Grand Total)
  const calculateSubtotal = () =>
    mainItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const tax = calculateSubtotal() * 0.11;
  const total = calculateSubtotal() + tax;

  useEffect(() => {
    const load = async () => {
      try {
        const [resCust, resProd, resTemp] = await Promise.all([
            fetch("http://localhost:5000/api/customers"),
            fetch("http://localhost:5000/api/inventory/products"),
            fetch("http://localhost:5000/api/quotations/templates")
        ]);
        
        if (resCust.ok) setCustomers(await resCust.json());
        if (resProd.ok) setProducts(await resProd.json());
        if (resTemp.ok) setTemplates(await resTemp.json());
      } catch (e) {
        console.error("Error loading data", e);
      }
    };
    load();
  }, []);

  const addMainItem = () => {
    setMainItems([...mainItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const addOptionalItem = () => {
    setOptionalItems([...optionalItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  // Generic Update Function
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
    if (!form.validUntil) return alert("Tanggal Valid Until harus diisi!"); // <--- VALIDASI

    const payload = {
      ...form,
      customerId: Number(form.customerId),
      templateId: form.templateId ? Number(form.templateId) : null,
      mainItems,
      optionalItems
    };

    try {
        const res = await fetch("http://localhost:5000/api/quotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    
        if (!res.ok) {
            const err = await res.json();
            return alert("❌ Gagal: " + err.error);
        }
    
        alert("✔ Quotation berhasil dibuat");
        router.push("/quotations");
    } catch (error) {
        alert("❌ Network Error");
    }
  };

  // Reusable Row Component biar kode tidak panjang
  const ItemRow = ({ item, index, list, setList }: any) => (
    <tr className="border-b border-gray-700">
        <td className="p-2">
            <select
            className="w-full bg-gray-800 p-2 rounded border border-gray-600"
            value={item.productId}
            onChange={(e) => updateItem(list, setList, index, "productId", e.target.value)}
            >
            <option value="">-- Select Product --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </td>
        <td className="p-2 w-20">
            <input type="number" value={item.quantity} min={1}
            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
            onChange={(e) => updateItem(list, setList, index, "quantity", Number(e.target.value))}
            />
        </td>
        <td className="p-2 w-32">
            <input type="number" value={item.unitPrice}
            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
            onChange={(e) => updateItem(list, setList, index, "unitPrice", Number(e.target.value))}
            />
        </td>
        <td className="p-2 text-cyan-400 font-bold text-right">
            Rp {fmt(item.unitPrice * item.quantity)}
        </td>
        <td className="p-2 text-center">
            <button className="text-red-400 hover:text-red-300 font-bold"
            onClick={() => removeItem(list, setList, index)}>✕</button>
        </td>
    </tr>
  );

  return (
    <section className="min-h-screen bg-gray-950 text-white p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Create Quotation</h1>
            <button
            onClick={submitForm}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
            Save Quotation
            </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl space-y-6">

            {/* --- SECTION 1: HEADER INFO --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Customer *</label>
                    <select
                        value={form.customerId}
                        onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Select Customer --</option>
                        {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Valid Until (Deadline) *</label>
                    <input 
                        type="date"
                        value={form.validUntil}
                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white appearance-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Template</label>
                    <select
                        value={form.templateId}
                        onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg"
                    >
                        <option value="">-- No Template --</option>
                        {templates.map((t) => <option key={t.id} value={t.id}>{t.templateName}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Payment Terms</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Net 30 Days"
                        value={form.paymentTerms}
                        onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg"
                    />
                </div>
            </div>

            {/* --- SECTION 2: ADDRESSES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Delivery Address</label>
                    <textarea 
                        rows={3}
                        value={form.deliveryAddress}
                        onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Invoice Address</label>
                    <textarea 
                        rows={3}
                        value={form.invoiceAddress}
                        onChange={(e) => setForm({ ...form, invoiceAddress: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg"
                    />
                </div>
            </div>

            <hr className="border-gray-800" />

            {/* --- SECTION 3: MAIN ITEMS --- */}
            <div>
                <h2 className="text-lg font-semibold text-blue-400 mb-3">Main Items</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-800 text-gray-400 text-sm">
                            <tr>
                                <th className="p-3 text-left">Product</th>
                                <th className="p-3 text-left">Qty</th>
                                <th className="p-3 text-left">Unit Price</th>
                                <th className="p-3 text-right">Subtotal</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainItems.map((item, idx) => (
                                <ItemRow key={idx} item={item} index={idx} list={mainItems} setList={setMainItems} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <button 
                    onClick={addMainItem}
                    className="mt-3 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded transition"
                >
                    + Add Product
                </button>
            </div>

            {/* --- SECTION 4: OPTIONAL ITEMS (Yang tadinya hilang) --- */}
            <div>
                <h2 className="text-lg font-semibold text-gray-400 mb-3">Optional Items</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-800 text-gray-400 text-sm">
                            <tr>
                                <th className="p-3 text-left">Product (Optional)</th>
                                <th className="p-3 text-left">Qty</th>
                                <th className="p-3 text-left">Unit Price</th>
                                <th className="p-3 text-right">Subtotal</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {optionalItems.map((item, idx) => (
                                <ItemRow key={idx} item={item} index={idx} list={optionalItems} setList={setOptionalItems} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <button 
                    onClick={addOptionalItem}
                    className="mt-3 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 rounded transition"
                >
                    + Add Optional Item
                </button>
            </div>

            {/* --- SECTION 5: TOTALS --- */}
            <div className="flex justify-end pt-4 border-t border-gray-800">
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>Rp {fmt(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Tax (11%)</span>
                        <span>Rp {fmt(tax)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-2 mt-2">
                        <span>Grand Total</span>
                        <span className="text-green-400">Rp {fmt(total)}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}