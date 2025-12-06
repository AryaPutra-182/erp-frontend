'use client'
import { useState, useRef, useEffect } from 'react'
import { useToast } from '../../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

const API_URL = "http://localhost:5000/api/inventory/products"

export default function EditProduct({ params }: any) {
  const { id } = params
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
    internalReference: ''
  })

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`${API_URL}/${id}`)
      const data = await res.json()

      setForm({
        name: data.name,
        type: data.type,
        salePrice: data.salePrice,
        cost: data.cost,
        category: data.category,
        internalReference: data.internalReference
      })

      if (data.image) {
        setImagePreview(`http://localhost:5000/uploads/${data.image}`)
      }
    }

    fetchProduct()
  }, [id])

  const triggerFile = () => fileRef.current?.click()

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setImageFile(f)
    if (f) setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!form.name.trim()) return push('Nama wajib diisi', 'error')

    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)))
    
    // only append file if user uploaded a new one
    if (imageFile) fd.append('image', imageFile)

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: fd
      })

      if (!res.ok) throw new Error()

      push('Produk berhasil diperbarui', 'success')
      router.push('/products')

    } catch {
      push('Gagal update produk', 'error')
    }
  }

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">Edit Product</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-10">

        {/* LEFT FORM */}
        <div className="col-span-2 space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nama</label>
            <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipe Produk</label>
            <select className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="Barang">Barang</option>
              <option value="Makanan">Makanan</option>
              <option value="Layanan">Layanan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Harga Jual</label>
              <input type="number" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700"
                value={form.salePrice}
                onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Cost</label>
              <input type="number" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <input className="bg-gray-900 px-3 py-2 rounded border border-gray-700" placeholder="Kategori"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />

            <input className="bg-gray-900 px-3 py-2 rounded border border-gray-700" placeholder="Internal Reference"
              value={form.internalReference}
              onChange={e => setForm({ ...form, internalReference: e.target.value })} />
          </div>
        </div>

        {/* IMAGE UPLOADER */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-40 h-40 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Image</span>
            )}
          </div>

          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={onImageChange} />

          <button type="button" className="mt-3 px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={triggerFile}>
            Change Image
          </button>
        </div>

      </form>

      <div className="mt-10 flex justify-end">
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 rounded-lg shadow hover:scale-105"
          type="submit"
          onClick={(e) => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}>
          Update
        </button>
      </div>
    </div>
  )
}
