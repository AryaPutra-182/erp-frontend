'use client'
import { useState, useRef, useEffect } from 'react'
import { useToast } from '../../../components/ToastProvider' // Pastikan path ini benar
import { useRouter } from 'next/navigation'

export default function CreateMaterial() {
  const { push } = useToast()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false) // 1. Loading State

  const [form, setForm] = useState({
    name: '',
    type: 'Langsung',
    cost: 0,
    category: '',
    internalReference: '',
    weight: 0
  })

  // Cleanup memory preview image saat component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const triggerFile = () => fileRef.current?.click()

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      // Hapus preview lama dari memory jika ada
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true) // Mulai Loading

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
      
      push('Material created successfully!', 'success')
      router.push('/products') // Redirect kembali ke list

    } catch (error) {
      console.error(error)
      push('Failed to create material', 'error')
    } finally {
      setIsLoading(false) // Selesai Loading
    }
  }

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Material</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LEFT SIDE FORM */}
        <div className="md:col-span-2 space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nama Material <span className="text-red-500">*</span></label>
            <input 
              required
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Besi Hollow 4x4"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipe Material</label>
            <select className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 outline-none transition"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="Langsung">Langsung (Direct)</option>
              <option value="Tidak Langsung">Tidak Langsung (Indirect)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Cost (Rp)</label>
              <input 
                type="number" 
                min="0"
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 outline-none transition"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Weight (gr)</label>
              <input 
                type="number" 
                min="0"
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 outline-none transition"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kategori</label>
              <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 outline-none transition"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Raw Material"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Internal Reference</label>
              <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 outline-none transition"
                value={form.internalReference}
                onChange={e => setForm({ ...form, internalReference: e.target.value })}
                placeholder="e.g. MAT-001"
              />
            </div>
          </div>

        </div>

        {/* RIGHT SIDE (IMAGE UPLOADER) */}
        <div className="md:col-span-1 flex flex-col items-center">
          <label className="block text-sm text-gray-300 mb-2 self-start">Material Image</label>
          <div className="w-full aspect-square max-w-[200px] rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shadow-lg relative group">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-xs">No Image</span>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />

          <div className="flex gap-2 mt-4 w-full max-w-[200px]">
             <button type="button"
              className="flex-1 py-2 rounded bg-gray-800 border border-gray-600 hover:bg-gray-700 text-sm transition"
              onClick={triggerFile}>
              {imageFile ? 'Change' : 'Select'}
            </button>
            {imagePreview && (
              <button type="button"
                className="px-3 py-2 rounded bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900 text-sm transition"
                onClick={() => { setImageFile(null); setImagePreview(null) }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON SECTION (Sekarang di dalam Form) */}
        <div className="md:col-span-3 mt-6 flex justify-end border-t border-gray-800 pt-6">
          <button 
            type="button"
            onClick={() => router.back()}
            className="mr-4 px-6 py-2 rounded text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
          >
            {isLoading ? 'Saving...' : 'Save Material'}
          </button>
        </div>

      </form>
    </div>
  )
}