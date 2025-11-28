'use client'
import { useState, useEffect } from 'react'
import { apiGet } from '../../lib/api'
import { Product } from '../../../types'
import { useToast } from '../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateManufacturing() {

  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  const [productId, setProductId] = useState(0)
  const [quantity, setQuantity] = useState(1.00)
  const [reference, setReference] = useState('')
  const [components, setComponents] = useState<{ materialId: number, qty: number }[]>([])

  const router = useRouter()
  const { push } = useToast()

  useEffect(() => {
    apiGet<Product[]>('/inventory/products').then(setProducts)
    apiGet<any[]>('/materials').then(setMaterials)
  }, [])

  const addMaterialLine = () => {
    setComponents([...components, { materialId: 0, qty: 1.00 }])
  }

  const availableMaterials = (comp: { materialId: number }[], current?: number) => {
    return materials.filter(m => m.id === current || !comp.map(x => x.materialId).includes(m.id))
  }

  const handleSave = async () => {
    const payload = {
      productId,
      quantity,
      reference,
      components
    }

    console.log("SEND TO BACKEND:", payload)

    try {
      const res = await fetch("http://localhost:5000/api/manufacturing-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("API error")

      push("Manufacturing order disimpan", "success")
      router.push("/manufacturing")

    } catch (e) {
      console.error(e)
      push("Gagal menyimpan manufacturing order", "error")
    }
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-700">

      <h2 className="text-3xl font-bold mb-6 text-cyan-300">Manufacturing Order</h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-gray-300 text-sm">Produk</label>
          <select
            value={productId}
            onChange={e => setProductId(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          >
            <option value={0}>Pilih Produk</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm">Jumlah</label>
          <input
            type="text"
            value={quantity.toFixed(2)}
            onChange={e => {
              const val = e.target.value.replace(",", ".")
              setQuantity(Number(val))
            }}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded text-left"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-300 text-sm">Reference</label>
          <input
            value={reference}
            onChange={e => setReference(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded"
          />
        </div>

      </div>

      <div className="mt-10">
        <label className="block text-gray-300 text-sm mb-2">Komponen</label>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-800 border border-gray-700">
            <tr>
              <th className="p-2 border border-gray-700 text-left text-gray-300">Material</th>
              <th className="p-2 border border-gray-700 text-center text-gray-300">Quantity</th>
              <th className="p-2 border border-gray-700 w-16 text-center"></th>
            </tr>
          </thead>

          <tbody>
            {components.map((row, i) => (
              <tr key={i}>

                <td className="p-2 border border-gray-700">
                  <select
                    value={row.materialId}
                    onChange={e => {
                      const arr = [...components]
                      arr[i].materialId = Number(e.target.value)
                      setComponents(arr)
                    }}
                    className="w-full bg-gray-800 border border-gray-600 px-2 py-1 rounded"
                  >
                    <option value={0}>Pilih Material</option>
                    {availableMaterials(components, row.materialId).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  {row.materialId !== 0 && (
                    <input
                      type="text"
                      value={row.qty.toFixed(2)}
                      onChange={e => {
                        const arr = [...components]
                        arr[i].qty = Number(e.target.value.replace(",", "."))
                        setComponents(arr)
                      }}
                      className="w-20 bg-gray-800 border border-gray-600 px-2 py-1 rounded text-left"
                    />
                  )}
                </td>

                <td className="p-2 border border-gray-700 text-center">
                  <button
                    type="button"
                    onClick={() => setComponents(components.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300"
                  >✕</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addMaterialLine}
          className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
        >
          + Add Line
        </button>
      </div>

      <div className="flex justify-end mt-10 gap-3">
        <button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
        <button 
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
          onClick={handleSave}
        >Save</button>
      </div>

    </div>
  )
}
