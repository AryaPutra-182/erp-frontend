'use client'
import { useState, useRef } from 'react'
import { useToast } from '../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateMaterial() {
  const { push } = useToast()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    type: 'Langsung',
    cost: 0,
    category: '',
    internalReference: '',
    weight: 0
  })

  const triggerFile = () => fileRef.current?.click()

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('type', form.type)
    fd.append('cost', String(form.cost))
    fd.append('category', form.category)
    fd.append('internalReference', form.internalReference)
    fd.append('weight', String(form.weight))
    if (imageFile) fd.append('image', imageFile)

    try {
      const res = await fetch('http://localhost:5000/api/materials', {
        method: 'POST',
        body: fd
      })

      if (!res.ok) throw new Error('API error')
      
      push('Material dibuat', 'success')
      router.push('/products')

    } catch (error) {
      push('Gagal membuat material', 'error')
    }
  }

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Material</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-10">

        {/* LEFT SIDE FORM */}
        <div className="col-span-2 space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nama Material</label>
            <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipe Material</label>
            <select className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="Langsung">Langsung</option>
              <option value="Tidak Langsung">Tidak Langsung</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Cost</label>
              <input type="number" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Weight (gr)</label>
              <input type="number" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kategori</label>
              <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Internal Reference</label>
              <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.internalReference}
                onChange={e => setForm({ ...form, internalReference: e.target.value })}
              />
            </div>
          </div>

        </div>

        {/* IMAGE UPLOADER */}
        <div className="col-span-1 flex flex-col items-center gap-3">

          <div className="w-40 h-40 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Image</span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />

          <button type="button"
            className="mt-1 px-4 py-2 rounded bg-cyan-500 text-black hover:bg-cyan-400 transition"
            onClick={triggerFile}>
            Upload
          </button>

          {imagePreview && (
            <button type="button"
              className="px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition"
              onClick={() => { setImageFile(null); setImagePreview(null) }}>
              Remove
            </button>
          )}
        </div>

      </form>

      <div className="mt-10 flex justify-end">
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg shadow hover:scale-105 transition transform" type="submit" onClick={(e) => document.querySelector('form')?.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}))}>
          Submit
        </button>
      </div>
    </div>
  )
}
