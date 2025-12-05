'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePurchase() {
  const [vendors, setVendors] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  
  const [form, setForm] = useState({
    vendorId: "",
    expectedDate: "",
  })

  const [items, setItems] = useState<{ materialId: string, qty: number, price: number }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Format Rupiah
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  useEffect(() => {
    // Load Vendor & Material
    Promise.all([
        fetch('http://localhost:5000/api/vendor').then(r => r.json()), // Pastikan route vendor ada
        fetch('http://localhost:5000/api/materials').then(r => r.json())
    ]).then(([v, m]) => {
        setVendors(v || [])
        setMaterials(m || [])
    })
  }, [])

  const addItem = () => setItems([...items, { materialId: "", qty: 1, price: 0 }])
  
  const updateItem = (idx: number, field: string, val: any) => {
    const newItems = [...items] as any
    newItems[idx][field] = val
    
    // Auto fill price jika material dipilih
    if(field === 'materialId') {
        const mat = materials.find(m => m.id == val)
        if(mat) newItems[idx].price = mat.cost || 0
    }
    setItems(newItems)
  }

  const handleSave = async () => {
    if(!form.vendorId) return alert("Pilih Vendor dulu!")
    
    setLoading(true)
    const payload = { ...form, items }

    try {
        const res = await fetch("http://localhost:5000/api/purchasing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        if(res.ok) {
            alert("✅ Purchase Order Created!")
            router.push("/purchasing") // Arahkan ke list PO
        }
    } catch(e) {
        alert("Error connection")
    } finally {
        setLoading(false)
    }
  }

  const grandTotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0)

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-8 flex justify-center">
      <div className="w-full max-w-5xl bg-[#161b22] border border-gray-800 rounded-2xl shadow-xl">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🛒 New Purchase Order
            </h1>
            <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Total Estimasi</p>
                <p className="text-xl font-mono font-bold text-emerald-400">Rp {fmt(grandTotal)}</p>
            </div>
        </div>

        <div className="p-8 space-y-6">
            {/* FORM ATAS */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Vendor</label>
                    <select 
                        className="w-full bg-[#0D1117] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-blue-500"
                        onChange={e => setForm({...form, vendorId: e.target.value})}
                    >
                        <option value="">-- Select Vendor --</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Expected Arrival</label>
                    <input 
                        type="date" 
                        className="w-full bg-[#0D1117] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-blue-500"
                        onChange={e => setForm({...form, expectedDate: e.target.value})}
                    />
                </div>
            </div>

            {/* TABEL ITEM */}
            <div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800 text-gray-400 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-3">Material</th>
                            <th className="p-3 w-32 text-center">Qty</th>
                            <th className="p-3 w-40 text-right">Price</th>
                            <th className="p-3 w-40 text-right">Subtotal</th>
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {items.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-800/30">
                                <td className="p-3">
                                    <select 
                                        className="w-full bg-transparent border-none text-white outline-none"
                                        value={item.materialId}
                                        onChange={e => updateItem(i, 'materialId', e.target.value)}
                                    >
                                        <option value="" className="bg-gray-900">Pilih Material...</option>
                                        {materials.map(m => (
                                            <option key={m.id} value={m.id} className="bg-gray-900">{m.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-3">
                                    <input 
                                        type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-center text-white"
                                        value={item.qty}
                                        onChange={e => updateItem(i, 'qty', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-3">
                                    <input 
                                        type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-right text-white"
                                        value={item.price}
                                        onChange={e => updateItem(i, 'price', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-3 text-right font-mono text-emerald-400">
                                    {fmt(item.qty * item.price)}
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => {
                                        const newI = items.filter((_, idx) => idx !== i)
                                        setItems(newI)
                                    }} className="text-red-500 hover:text-red-400">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addItem} className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase">+ Add Line</button>
            </div>

            {/* FOOTER */}
            <div className="pt-6 border-t border-gray-800 flex justify-end gap-3">
                <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Discard</button>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                >
                    {loading ? "Saving..." : "Confirm Order"}
                </button>
            </div>

        </div>
      </div>
    </section>
  )
}