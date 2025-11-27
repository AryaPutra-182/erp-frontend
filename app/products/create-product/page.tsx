'use client'
import { useState, useRef } from 'react'
import { useToast } from '../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateProduct() {
  const { push } = useToast()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    type: 'Barang',
    salePrice: 0,
    cost: 0,
    category: '',
    internalReference: '',
    stock: 0
  })

  const triggerFile = () => fileRef.current?.click()

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setImageFile(f)
    if (f) setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name.trim()) return push('Nama produk wajib', 'error')

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('type', form.type)
    fd.append('salePrice', String(form.salePrice))
    fd.append('cost', String(form.cost))
    fd.append('category', form.category)
    fd.append('internalReference', form.internalReference)
    fd.append('stock', String(form.stock))

    if (imageFile) fd.append('image', imageFile)

    try {
      const res = await fetch('http://localhost:5000/api/inventory/products', {
        method: 'POST',
        body: fd
      })

      if (!res.ok) throw new Error('API error')

      push('Produk dibuat', 'success')
      router.push('/products')

    } catch (error) {
      push('Gagal membuat produk', 'error')
    }
  }

  return (
    <div className="bg-black text-white p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Product</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex gap-6">

        {/* LEFT SIDE FORM */}
        <div className="flex-1 space-y-4">

          <label>Nama Produk</label>
          <input className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <label>Tipe Produk</label>
          <select className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="Barang">Barang</option>
            <option value="Makanan">Makanan</option>
            <option value="Layanan">Layanan</option>
          </select>

          <label>Harga Jual</label>
          <input type="number" className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.salePrice}
            onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })}
          />

          <label>Cost</label>
          <input type="number" className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.cost}
            onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
          />

          <label>Kategori</label>
          <input className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          />

          <label>Internal Reference</label>
          <input className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.internalReference}
            onChange={e => setForm({ ...form, internalReference: e.target.value })}
          />

          <label>Stock</label>
          <input type="number" className="w-full bg-gray-800 px-3 py-2 rounded"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
          />

        </div>

        {/* IMAGE UPLOADER */}
        <div className="w-48 flex flex-col items-center">
          <div className="w-36 h-36 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-500 text-sm">No Image</span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />

          <button type="button" className="mt-3 px-4 py-1 rounded bg-cyan-500 text-slate-900" onClick={triggerFile}>
            Upload
          </button>

          {imagePreview && (
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded bg-slate-700 text-cyan-200 border border-slate-600"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
            >
              Remove
            </button>
          )}
        </div>

      </form>

      {/* SUBMIT BUTTON (INSIDE FORM SEKARANG) */}
      <form onSubmit={handleSubmit}>
        <button className="mt-8 bg-teal-600 px-4 py-2 rounded" type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}
