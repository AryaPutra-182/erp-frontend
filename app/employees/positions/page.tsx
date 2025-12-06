'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet } from "../../lib/api"

const API_BASE_URL = "http://localhost:5000"

type Position = {
  id: number
  name: string
}

type ConfirmState = {
  open: boolean
  id: number | null
  name: string
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmData, setConfirmData] = useState<ConfirmState>({
    open: false,
    id: null,
    name: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // === LOAD POSITIONS ===
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await apiGet<Position[]>("/positions")
        setPositions(data || [])
      } catch (e) {
        console.error("Gagal load positions:", e)
        setPositions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
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

      // SESUAIKAN JIKA ENDPOINTMU BERBEDA
      const res = await fetch(
        `${API_BASE_URL}/api/positions/${confirmData.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error("Gagal menghapus position")

      // Hapus dari state
      setPositions(prev => prev.filter(p => p.id !== confirmData.id))

      // Tutup modal
      setConfirmData(prev => ({ ...prev, open: false }))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Terjadi kesalahan saat menghapus position")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
        <div className="h-8 w-52 bg-gray-800 rounded animate-pulse mb-6" />
        <div className="rounded-lg border border-gray-800 bg-[#161b22] h-32" />
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          Job Positions
        </h1>

        <Link
          href="/employees/positions/create-position"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white transition font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Position
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
        <table className="w-full bg-[#161b22] text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
            <tr>
              <th className="py-3 px-6 border-b border-gray-700">Position Name</th>
              <th className="py-3 px-6 text-center border-b border-gray-700 w-32">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {positions.length > 0 ? (
              positions.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-800/50 transition"
                >
                  {/* Position Name */}
                  <td className="py-4 px-6 text-white font-medium">
                    {p.name}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={(e) => openConfirmDelete(e, p.id, p.name)}
                      className="text-red-400 hover:text-red-300 hover:underline transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-8 px-6 text-center text-gray-500">
                  No positions found. Create one to continue.
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
              Hapus Position?
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
              <p className="text-xs text-red-400 mb-3">
                {errorMsg}
              </p>
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
