'use client'
import { useState, useEffect } from 'react'
import { apiGet } from '../../../lib/api' 
import { useRouter } from 'next/navigation'
import SearchableProductSelect from '../../../../components/SearchableProductSelect';
import { useToast } from '../../../../components/ToastProvider'   // ✅ pakai toast

// Definisi Tipe Data
interface Product { 
  id: number; 
  name: string; 
  sku?: string; 
}

interface Material {
  id: number;
  name: string;
  cost: number;
  internalReference?: string;
}

export default function CreateBOM() {

  // --- STATES ---
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  const [productId, setProductId] = useState<number | string>("") 
  const [quantity, setQuantity] = useState(1.00)
  const [reference, setReference] = useState('')
  const [components, setComponents] = useState<{ materialId: number, qty: number }[]>([])
  
  const [loading, setLoading] = useState(false) 

  // error untuk product
  const [productError, setProductError] = useState<string | null>(null)

  // ⭐ state untuk notif "BOM berhasil disimpan"
  const [showSuccess, setShowSuccess] = useState(false)

  const router = useRouter()
  const { push } = useToast()          

  // --- FETCH DATA MASTER ---
  useEffect(() => {
    const loadData = async () => {
        try {
            const [prodRes, matRes] = await Promise.all([
                apiGet<Product[]>('/inventory/products'),
                apiGet<any[]>('/materials')
            ])
            setProducts(prodRes || [])
            setMaterials(matRes || [])
        } catch (e) {
            console.error("Gagal load data master:", e)
            push('Gagal memuat data master', 'error')
        }
    }
    loadData()
  }, [push])

  // --- LOGIC TABEL KOMPONEN ---
  const addMaterialLine = () => {
    setComponents([...components, { materialId: 0, qty: 1.00 }])
  }

  const removeMaterialLine = (index: number) => {
    setComponents(components.filter((_, idx) => idx !== index))
  }

  const updateComponent = (index: number, field: 'materialId' | 'qty', value: number) => {
    const newComponents = [...components]
    newComponents[index] = { ...newComponents[index], [field]: value }
    setComponents(newComponents)
  }

  // Helper: Filter material agar tidak dobel (opsional, UX bagus)
  const availableMaterials = (currentId: number) => {
    const selectedIds = components.map(c => c.materialId);
    return materials.filter(m => !selectedIds.includes(m.id) || m.id === currentId);
  }

  // --- HANDLE SAVE ---
  const handleSave = async () => {
    // 1. Validasi PRODUCT TARGET
    if (!productId) {
      setProductError("Harap pilih produk target")
      return
    }

    // 2. Validasi lain
    if (quantity <= 0) {
      push('Jumlah per batch harus lebih dari 0', 'error')
      return
    }

    if (components.length === 0) {
      push('Tambahkan minimal 1 komponen material', 'error')
      return
    }
    
    const invalidComp = components.find(c => c.materialId === 0 || c.qty <= 0);
    if (invalidComp) {
      push('Ada komponen yang belum lengkap (material kosong atau qty 0)', 'error')
      return
    }

    setLoading(true)

    // 3. Payload
    const payload = {
      productId: Number(productId),
      quantity: Number(quantity),
      reference: reference || `BOM-${Date.now()}`, // Auto generate ref jika kosong
      components
    }

    try {
      const res = await fetch("http://localhost:5000/api/manufacturing-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const responseData = await res.json();

      if (!res.ok) {
          throw new Error(responseData.error || responseData.message || "Gagal menyimpan")
      }

      // ✅ SUCCESS: tampilkan UI "BOM berhasil disimpan"
      setShowSuccess(true)

      // kasih waktu user lihat notif dulu baru redirect
      setTimeout(() => {
        router.push("/manufacturing/bom")
      }, 1200)

    } catch (e: any) {
      console.error(e)
      push(`Error: ${e.message}`, 'error')
    } finally {
        setLoading(false)
    }
  }

  // --- RENDER UI ---
  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 flex justify-center">
      
      <div className="w-full max-w-5xl bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    New Bill of Material (BOM)
                </h1>
                <p className="text-gray-400 text-sm mt-1 ml-11">
                    Define the recipe and components for a product.
                </p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => router.back()}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 font-medium transition"
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
                    ) : "Save BOM"}
                </button>
            </div>
        </div>

        <div className="p-8 space-y-8">
            
            {/* FORM INPUT UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
                
                {/* Kolom 1: Product (Lebar) */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product Target</label>
                    <SearchableProductSelect
                        products={products}
                        selectedValue={productId}
                        onChange={(val) => {
                          setProductId(val)
                          if (val) setProductError(null)
                        }}
                        disabled={false}
                    />
                    {productError && (
                      <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        {productError}
                      </p>
                    )}
                </div>

                {/* Kolom 2: Quantity */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity (Per Batch)</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg font-mono focus:border-yellow-500 outline-none transition"
                    />
                </div>

                {/* Kolom 3: Reference (Full Width) */}
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">BOM Reference / Code</label>
                    <input
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                        placeholder="e.g., BOM-2023-001 (Auto-generated if empty)"
                        className="w-full bg-[#0D1117] border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:border-yellow-500 outline-none transition"
                    />
                </div>
            </div>

            {/* TABEL KOMPONEN */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Components (Raw Materials)
                    </h3>
                    <button
                        type="button"
                        onClick={addMaterialLine}
                        className="text-xs flex items-center gap-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-3 py-1.5 rounded-lg transition font-bold uppercase"
                    >
                        + Add Component
                    </button>
                </div>

                <div className="border border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Material</th>
                                <th className="p-4 w-40 text-center">Qty Required</th>
                                <th className="p-4 w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-[#0D1117]">
                            {components.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-gray-500 italic flex flex-col items-center justify-center">
                                        <span className="text-2xl mb-2">📦</span>
                                        No components added yet. Click "+ Add Component" to start.
                                    </td>
                                </tr>
                            ) : (
                                components.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-800/30 transition">
                                        <td className="p-3">
                                            <select
                                                value={row.materialId}
                                                onChange={e => updateComponent(i, 'materialId', Number(e.target.value))}
                                                className="w-full bg-[#161b22] border border-gray-700 px-3 py-2.5 rounded-lg focus:border-blue-500 outline-none text-white transition"
                                            >
                                                <option value={0}>-- Select Material --</option>
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
                                                onChange={e => updateComponent(i, 'qty', Number(e.target.value))}
                                                className="w-full bg-[#161b22] border border-gray-700 text-center px-2 py-2.5 rounded-lg focus:border-blue-500 outline-none font-mono text-white transition"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeMaterialLine(i)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                title="Remove Line"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>

      {/* ⭐ NOTIF "BOM berhasil disimpan" DI TENGAH */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* optional overlay gelap */}
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-xl text-xl font-semibold animate-bounce">
            BOM berhasil disimpan
          </div>
        </div>
      )}
    </section>
  )
}
