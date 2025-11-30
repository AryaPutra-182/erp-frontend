'use client'
import { useState, useRef } from 'react'
import { useToast } from '../../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateVendor() {

  const { push } = useToast()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    vendorName: '',
    address: '',
    phone: '',
    email: '',
    website: ''
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
    fd.append('vendorName', form.vendorName)
    fd.append('address', form.address)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('website', form.website)
    if (imageFile) fd.append('image', imageFile)

    try {
      const res = await fetch('http://localhost:5000/api/vendor', {
        method: 'POST',
        body: fd
      })

      if (!res.ok) throw new Error('API error')
      
      push('Vendor berhasil dibuat', 'success')
      router.push('/purchasing/vendors')

    } catch (error) {
      push('Gagal membuat vendor', 'error')
    }
  }

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">

      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Vendor</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-10">

        {/* INPUT FORM LEFT SIDE */}
        <div className="col-span-2 space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nama Vendor</label>
            <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.vendorName}
              onChange={e => setForm({ ...form, vendorName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Alamat</label>
            <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nomor HP</label>
            <input type="tel" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input type="email" className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Website</label>
            <input className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
            />
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
            Upload Foto Vendor
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
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg shadow hover:scale-105 transition transform"
          type="submit" 
          onClick={(e) => document.querySelector('form')?.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}))}>
          Create
        </button>
      </div>
    </div>
  )
}
