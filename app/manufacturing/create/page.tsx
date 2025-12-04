'use client'
import { useState, useEffect } from 'react'
import { apiGet } from '../../lib/api'
import { Product } from '../../../types' // Pastikan path type benar
import { useRouter } from 'next/navigation'

export default function CreateManufacturing() {

  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  const [productId, setProductId] = useState<number | string>("") // Default kosong biar placeholder muncul
  const [quantity, setQuantity] = useState(1.00)
  const [reference, setReference] = useState('')
  const [components, setComponents] = useState<{ materialId: number, qty: number }[]>([])
  
  const [loading, setLoading] = useState(false) // State loading saat save

  const router = useRouter()

  useEffect(() => {
    // Load Data Master
    const loadData = async () => {
        try {
            const [prodRes, matRes] = await Promise.all([
                apiGet<Product[]>('/inventory/products'),
                apiGet<any[]>('/materials')
            ])
            setProducts(prodRes)
            setMaterials(matRes)
        } catch (e) {
            console.error("Gagal load data", e)
        }
    }
    loadData()
  }, [])

  const addMaterialLine = () => {
    setComponents([...components, { materialId: 0, qty: 1.00 }])
  }

  const removeMaterialLine = (index: number) => {
    setComponents(components.filter((_, idx) => idx !== index))
  }

  // Logic agar material yang sudah dipilih di baris lain tidak muncul lagi (kecuali baris itu sendiri)
  const availableMaterials = (currentMaterialId: number) => {
    const selectedIds = components.map(c => c.materialId);
    return materials.filter(m => !selectedIds.includes(m.id) || m.id === currentMaterialId);
  }

  const handleSave = async () => {
    // 1. VALIDASI FRONTEND
    if (!productId) return alert("❌ Harap pilih Produk terlebih dahulu!")
    if (quantity <= 0) return alert("❌ Jumlah produksi harus lebih dari 0")
    if (components.length === 0) return alert("❌ Harap tambahkan minimal 1 komponen material")
    
    // Cek jika ada baris material yang belum dipilih
    const invalidComp = components.find(c => c.materialId === 0 || c.qty <= 0);
    if (invalidComp) return alert("❌ Ada baris komponen yang belum lengkap (Material kosong atau Qty 0)")

    setLoading(true)

    const payload = {
      productId: Number(productId),
      quantity,
      reference,
      components
    }

    console.log("📦 SEND TO BACKEND:", payload)

    try {
      // Pastikan URL Endpoint sesuai backend Anda
      const res = await fetch("http://localhost:5000/api/manufacturing-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const responseData = await res.json();

      if (!res.ok) {
          throw new Error(responseData.message || "Gagal menyimpan")
      }

      alert("✅ Bill of Material Berhasil Disimpan!")
      router.push("/manufacturing") 

    } catch (e: any) {
      console.error(e)
      alert("❌ Error: " + e.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 flex justify-center">
      
      <div className="w-full max-w-5xl bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    New Bill of Material (BOM)
                </h1>
                <p className="text-gray-400 text-sm mt-1 ml-11">
                    Create a new recipe/structure for manufacturing a product.
                </p>
            </div>
        </div>

        <div className="p-8 space-y-8">
            
            {/* FORM UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product Target</label>
                    <select
                        value={productId}
                        onChange={e => setProductId(e.target.value)}
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reference (Optional)</label>
                        <input
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            placeholder="Auto-generated if empty"
                            className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800"></div>

            {/* KOMPONEN TABLE */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        Components (Raw Materials)
                    </h3>
                    <button
                        type="button"
                        onClick={addMaterialLine}
                        className="text-xs flex items-center gap-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded transition font-bold uppercase"
                    >
                        + Add Component
                    </button>
                </div>

                <div className="border border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Material</th>
                                <th className="p-4 w-32 text-center">Qty Required</th>
                                <th className="p-4 w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-[#0D1117]">
                            {components.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500 italic">
                                        No components added yet. Click "Add Component" to start.
                                    </td>
                                </tr>
                            ) : (
                                components.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-800/30 transition">
                                        <td className="p-3">
                                            <select
                                                value={row.materialId}
                                                onChange={e => {
                                                    const arr = [...components]
                                                    arr[i].materialId = Number(e.target.value)
                                                    setComponents(arr)
                                                }}
                                                className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg focus:border-blue-500 outline-none text-white"
                                            >
                                                <option value={0}>-- Select Material --</option>
                                                {/* Tampilkan material yang belum dipilih saja (plus material yang sedang dipilih baris ini) */}
                                                {availableMaterials(row.materialId).map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={row.qty}
                                                onChange={e => {
                                                    const arr = [...components]
                                                    arr[i].qty = Number(e.target.value)
                                                    setComponents(arr)
                                                }}
                                                className="w-full bg-gray-900 border border-gray-700 text-center px-2 py-2 rounded-lg focus:border-blue-500 outline-none font-mono text-white"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeMaterialLine(i)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-end pt-6 gap-4 border-t border-gray-800">
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition shadow-lg shadow-emerald-900/20 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                           <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Saving...
                        </>
                    ) : (
                        "Save Bill of Material"
                    )}
                </button>
            </div>

        </div>
      </div>
    </section>
  )
}