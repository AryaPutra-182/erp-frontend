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
  const [quantity, setQuantity] = useState(0)
  const [bomName, setBomName] = useState('')
  const [components, setComponents] = useState<number[]>([])  

  const router = useRouter()
  const { push } = useToast()

  useEffect(() => {
    apiGet<Product[]>('/inventory/products').then(setProducts)
    apiGet<any[]>('/materials').then(setMaterials)
  }, [])

  const handleComponentChange = (i: number, value: number) => {
    const updated = [...components]
    updated[i] = value
    setComponents(updated)
  }

  const addMaterialLine = () => {
    setComponents([...components, 0])
  }

  const availableMaterials = (selected: number[], current?: number) => {
    return materials.filter(m => m.id === current || !selected.includes(m.id))
  }

  return (
    <div className="bg-gray-950 text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-8 text-cyan-300 tracking-wide">Manufacturing Orders</h1>

      <form className="space-y-8">

        {/* Produk */}
        <div>
          <label className="text-sm text-gray-300 font-semibold uppercase tracking-wide">Produk</label>
          <select
            className="mt-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 transition"
            value={productId}
            onChange={e => setProductId(Number(e.target.value))}
          >
            <option value={0}>Pilih Produk</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Kuantitas */}
        <div>
          <label className="text-sm text-gray-300 font-semibold uppercase tracking-wide">Kuantitas</label>
          <input
            type="number"
            className="mt-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 transition"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
          />
        </div>

        {/* BOM */}
        <div>
          <label className="text-sm text-gray-300 font-semibold uppercase tracking-wide">Bill Of Materials</label>
          <input
            className="mt-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 transition"
            value={bomName}
            onChange={e => setBomName(e.target.value)}
          />
        </div>

        {/* Material Section */}
        <div>
          <label className="text-sm text-gray-300 font-semibold uppercase tracking-wide">Komponen Material</label>

          <button
            type="button"
            onClick={addMaterialLine}
            className="mt-3 bg-cyan-600 px-4 py-2 rounded-lg text-sm hover:bg-cyan-500 transition font-semibold"
          >
            + Add Material
          </button>

          {components.length > 0 && (
            <div className="mt-4 space-y-4">
              {components.map((selectedValue, i) => (
                <select
                  key={i}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 transition"
                  value={selectedValue}
                  onChange={e => handleComponentChange(i, Number(e.target.value))}
                >
                  <option value={0}>Pilih Material</option>

                  {availableMaterials(components, selectedValue).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-600 py-3 rounded-lg font-bold text-lg hover:bg-green-500 transition"
        >
          Simpan
        </button>

      </form>
    </div>
  )
}
