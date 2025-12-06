'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet } from "../../lib/api" // Sesuaikan path import lib/api Anda

const API_BASE_URL = "http://localhost:5000"

type Department = {
  id: number
  name: string
  manager?: { name: string } | null
  parent?: { name: string } | null
}

type ConfirmState = {
  open: boolean
  id: number | null
  name: string
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmData, setConfirmData] = useState<ConfirmState>({
    open: false,
    id: null,
    name: "",
  })

  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // === LOAD DATA DEPARTMENTS ===
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiGet<Department[]>("/departments")
        setDepartments(data || [])
      } catch (e) {
        console.error("Gagal load departments:", e)
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // === BUKA MODAL KONFIRMASI ===
  const openConfirmDelete = (
    e: React.MouseEvent,
    id: number,
    name: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setConfirmData({
      open: true,
      id,
      name,
    })
    setErrorMsg(null)
  }

  // === TUTUP MODAL ===
  const closeConfirm = () => {
    if (isDeleting) return
    setConfirmData(prev => ({ ...prev, open: false }))
    setErrorMsg(null)
  }

  // === EKSEKUSI DELETE ===
  const handleConfirmDelete = async () => {
    if (!confirmData.id) return

    try {
      setIsDeleting(true)
      setErrorMsg(null)

      // SESUAIKAN JIKA ENDPOINT BACKEND ANDA BERBEDA
      const res = await fetch(
        `${API_BASE_URL}/api/departments/${confirmData.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error("Gagal menghapus department")

      // Hapus dari state
      setDepartments(prev => prev.filter(d => d.id !== confirmData.id))

      // Tutup modal
      setConfirmData(prev => ({ ...prev, open: false }))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Terjadi kesalahan saat menghapus department")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
        <div className="h-8 w-52 bg-gray-800 rounded animate-pulse mb-6" />
        <div className="rounded-lg border border-gray-800 bg-[#161b22]">
          <div className="h-12 border-b border-gray-800 bg-gray-900/60" />
          <div className="h-24" />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Departments</h1>

        <Link
          href="/employees/departments/create-department"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white transition font-medium flex items-center gap-2"
        >
          <span>+</span> Add Department
        </Link>
      </div>

      {/* TABLE LIST */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
        <table className="w-full bg-[#161b22] text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
            <tr>
              <th className="py-3 px-6 border-b border-gray-700">Name</th>
              <th className="py-3 px-6 border-b border-gray-700">Manager</th>
              <th className="py-3 px-6 border-b border-gray-700">Parent Dept</th>
              <th className="py-3 px-6 text-center border-b border-gray-700 w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {departments.length > 0 ? (
              departments.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-800/50 transition duration-150"
                >
                  {/* Name */}
                  <td className="py-4 px-6 font-medium text-white">
                    {d.name}
                  </td>

                  {/* Manager */}
                  <td className="py-4 px-6 text-gray-300">
                    {d.manager ? (
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-xs text-blue-200 border border-blue-800">
                          {d.manager.name.charAt(0)}
                        </span>
                        {d.manager.name}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">-</span>
                    )}
                  </td>

                  {/* Parent Dept */}
                  <td className="py-4 px-6 text-gray-300">
                    {d.parent ? (
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">
                        {d.parent.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Root Level</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-4 items-center">
                      {/* Link Edit */}
                      <Link
                        href={`/employees/departments/edit/${d.id}`}
                        className="text-blue-400 hover:text-blue-300 hover:underline transition font-medium text-sm"
                      >
                        Edit
                      </Link>

                      {/* Delete dengan popup konfirmasi */}
                      <button
                        onClick={(e) => openConfirmDelete(e, d.id, d.name)}
                        className="text-red-400 hover:text-red-300 hover:underline transition font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="py-12 px-6 text-gray-500 text-center"
                  colSpan={4}
                >
                  <p className="text-lg mb-2">No departments found.</p>
                  <p className="text-sm">
                    Create a new department to organize your employees.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL KONFIRMASI DELETE */}
      {confirmData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirm}
          />

          {/* card popup kecil */}
          <div className="relative bg-[#0D1117] border border-gray-700 rounded-xl p-5 w-full max-w-sm shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Hapus Department?
            </h3>

            <p className="text-sm text-gray-300 mb-4">
              Yakin ingin menghapus{" "}
              <span className="font-semibold text-white">
                {confirmData.name}
              </span>
              ? <br />
              Aksi ini tidak dapat dibatalkan.
            </p>

            {errorMsg && (
              <p className="text-xs text-red-400 mb-3">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 text-sm disabled:opacity-60"
              >
                Tidak
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
