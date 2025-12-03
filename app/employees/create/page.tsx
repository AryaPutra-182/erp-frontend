'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '../../../components/ToastProvider'
import { useRouter } from 'next/navigation'

export default function CreateEmployee() {
  const { push } = useToast()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    positionId: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDept = await fetch('http://localhost:5000/api/departments')
        if (resDept.ok) setDepartments(await resDept.json())
      } catch {}

      try {
        const resPos = await fetch('http://localhost:5000/api/positions')
        if (resPos.ok) setPositions(await resPos.json())
      } catch {}
    }
    fetchData()
  }, [])

  const triggerFile = () => fileRef.current?.click()

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPhotoFile(file)
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name.trim()) return push('Nama wajib diisi', 'error')
    if (!form.departmentId) return push('Departemen wajib', 'error')
    if (!form.positionId) return push('Jabatan wajib', 'error')

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('email', form.email)
    fd.append('phone', form.phone)
    fd.append('departmentId', form.departmentId)
    fd.append('positionId', form.positionId)

    if (photoFile) fd.append('photo', photoFile)

    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        body: fd
      })

      if (!res.ok) throw new Error()

      push('Employee berhasil ditambahkan 🎉', 'success')
      router.push('/employees')

    } catch {
      push('❌ Gagal membuat employee', 'error')
    }
  }

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Employee</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-5">

          {/* NAME */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nama *</label>
            <input
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex: John Doe"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ex: johndoe@mail.com"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone</label>
            <input
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+62 .."
            />
          </div>

          {/* DROPDOWNS */}
          <div className="grid grid-cols-2 gap-5">

            {/* POSITION */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Posisi *</label>
              <select
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.positionId}
                onChange={(e) => setForm({ ...form, positionId: e.target.value })}
              >
                <option value="">-- Select Position --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Departemen *</label>
              <select
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (PHOTO) */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-40 h-40 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
            {photoPreview ? (
              <img src={photoPreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Image</span>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />

          <button
            type="button"
            className="mt-3 px-4 py-2 rounded bg-cyan-500 text-black hover:bg-cyan-400 transition"
            onClick={triggerFile}
          >
            Upload
          </button>

          {photoPreview && (
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
            >
              Remove
            </button>
          )}
        </div>
      </form>

      {/* SUBMIT BUTTON */}
      <div className="mt-10 flex justify-end">
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg shadow hover:scale-105 transition"
          type="submit"
          onClick={() =>
            document.querySelector("form")?.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            )
          }
        >
          Submit
        </button>
      </div>
    </div>
  )
}
