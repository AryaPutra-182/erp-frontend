'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet } from "../lib/api"

const API_BASE_URL = "http://localhost:5000"

type ConfirmState = {
  open: boolean
  id: number | null
  name: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmData, setConfirmData] = useState<ConfirmState>({
    open: false,
    id: null,
    name: "",
  })

  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // === LOAD EMPLOYEES ===
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiGet<any[]>("/employees")
        setEmployees(res || [])
      } catch (e) {
        console.log("Gagal load employee:", e)
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // === BUKA MODAL KONFIRMASI ===
  const openConfirmDelete = (
    e: React.MouseEvent,
    id: number,
    name: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setConfirmData({ open: true, id, name })
  }

  // === TUTUP MODAL ===
  const closeConfirm = () => {
    if (!isDeleting) setConfirmData(prev => ({ ...prev, open: false }))
  }

  // === HAPUS EMPLOYEE ===
  const handleConfirmDelete = async () => {
    if (!confirmData.id) return

    try {
      setIsDeleting(true)
      setErrorMsg(null)

      const res = await fetch(`${API_BASE_URL}/api/employees/${confirmData.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Gagal menghapus employee")

      setEmployees(prev => prev.filter(emp => emp.id !== confirmData.id))

      closeConfirm()
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus employee.")
    } finally {
      setIsDeleting(false)
    }
  }

  // === AMANIN URL FOTO ===
  const buildPhotoUrl = (photo: string | null) => {
    if (!photo) return null

    let fix = photo.trim().replace(/\\/g, "/")
    if (fix.startsWith("/")) fix = fix.substring(1)
    if (!fix.startsWith("uploads/")) fix = `uploads/${fix}`

    return `${API_BASE_URL}/${fix}`
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Employee Directory
        </h1>

        <div className="flex gap-3">
          <Link href="/employees/create" className="px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500">
            Add Employee
          </Link>
        </div>
      </div>

      {/* GRID EMPLOYEES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {employees.map((emp) => {
          const photoUrl = buildPhotoUrl(emp.photo)

          return (
            <Link
              key={emp.id}
              href={`/employees/${emp.id}`}
              className="group relative bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-gray-600 transition-all"
            >

              {/* DELETE BUTTON */}
              <button
                onClick={(e) => openConfirmDelete(e, emp.id, emp.name)}
                className="absolute top-3 right-3 z-20 bg-gray-900/80 backdrop-blur text-red-400 p-2 rounded-lg opacity-0 
                group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all border border-gray-700 hover:border-red-500"
              >
                🗑️
              </button>

              {/* PHOTO */}
              <div className="h-48 bg-gray-800 overflow-hidden relative">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    👤
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition">
                  {emp.name}
                </h2>

                <p className="text-emerald-400 text-sm">
                  {emp.Position?.name || "No Position"}
                </p>

                <div className="mt-3 border-t border-gray-800 pt-3">
                  <p className="text-sm text-gray-400">
                    Dept: {emp.Department?.name || "No Department"}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">{emp.email}</p>
                   <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              </div>

            </Link>
          )
        })}
      </div>

      {/* === POPUP KONFIRMASI DELETE === */}
      {confirmData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirm}
          />

          {/* CARD */}
          <div className="relative bg-[#0D1117] border border-gray-700 rounded-xl p-5 w-full max-w-sm shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Hapus Employee?
            </h3>

            <p className="text-sm text-gray-300 mb-4">
              Yakin ingin menghapus{" "}
              <span className="font-semibold text-white">{confirmData.name}</span>?  
              <br />Aksi ini tidak dapat dibatalkan.
            </p>

            {errorMsg && <p className="text-xs text-red-400 mb-3">{errorMsg}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 text-sm"
              >
                Tidak
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>

        </div>
      )}

    </section>
  )
}
