'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../../lib/api'
import { Vendor } from '../../../types'

const API_BASE_URL = "http://localhost:5000"

type ConfirmState = {
  open: boolean
  id: number | null
  name: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmData, setConfirmData] = useState<ConfirmState>({
    open: false,
    id: null,
    name: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // --- LOAD DATA VENDOR ---
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await apiGet<Vendor[]>('/vendor')
        setVendors(data || [])
      } catch (e) {
        console.error('Gagal load vendor:', e)
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [])

  // --- BUKA MODAL KONFIRMASI ---
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

  // --- TUTUP MODAL ---
  const closeConfirm = () => {
    if (isDeleting) return
    setConfirmData(prev => ({ ...prev, open: false }))
    setErrorMsg(null)
  }

  // --- EKSEKUSI DELETE ---
  const handleConfirmDelete = async () => {
    if (!confirmData.id) return

    try {
      setIsDeleting(true)
      setErrorMsg(null)

      const res = await fetch(`${API_BASE_URL}/api/vendor/${confirmData.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Gagal menghapus vendor')

      // hapus dari state
      setVendors(prev => prev.filter(v => v.id !== confirmData.id))

      // tutup modal
      setConfirmData(prev => ({ ...prev, open: false }))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghapus vendor')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="p-6 max-w-7xl mx-auto min-h-screen bg-[#0D1117] text-gray-200">
        <div className="h-8 w-56 bg-gray-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-44 bg-[#161b22] border border-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 max-w-7xl mx-auto min-h-screen bg-[#0D1117]">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-2">
          {/* BACK BUTTON */}
          <Link
            href="/purchasing"
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-green-600 border border-blue-700 text-gray-300 
              hover:bg-red-700 hover:text-white shadow-sm
              transition-all group
            "
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span className="text-sm">Back</span>
          </Link>

          <h1 className="text-3xl font-bold text-white tracking-tight">
            Vendor Management
          </h1>
        </div>

        <Link
          href="/purchasing/vendors/create"
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-green-900/20 transition-all hover:scale-105 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Create New
        </Link>
      </div>

      {/* VENDOR GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendors.map(v => (
          <div
            key={v.id}
            className="group bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4 relative overflow-hidden"
          >
            {/* DELETE BUTTON (SAMA STYLE DENGAN PRODUCT DELETE) */}
            <button
              onClick={(e) => openConfirmDelete(e, v.id, v.vendorName)}
              className="absolute top-3 right-3 z-20 bg-gray-900/80 backdrop-blur text-red-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 border border-gray-700 hover:border-red-500"
              title="Delete Vendor"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

            {/* Soft BG decor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-cyan-500/10 transition" />

            <div className="flex items-start gap-4 z-10">
              {/* Avatar */}
              <div className="w-14 h-14 flex-shrink-0 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-sm">
                <img
                  src={
                    v.image
                      ? `http://localhost:5000/uploads/${v.image.replace(/\\/g, '/')}`
                      : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  alt={v.vendorName}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg leading-tight truncate group-hover:text-cyan-400 transition">
                  {v.vendorName}
                </h3>

                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">
                  Supplier
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-800 w-full" />

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <span className="text-gray-600 mt-0.5">📍</span>
                <p className="line-clamp-2 text-xs leading-relaxed">
                  {v.address || 'No address provided'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-gray-600">✉️</span>
                <p className="truncate text-xs text-cyan-200/80 hover:text-cyan-300 cursor-pointer">
                  {v.email || 'No email'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {vendors.length === 0 && (
          <div className="col-span-full py-12 flex flex.col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="mb-2 text-4xl">📭</p>
            <p>No vendors found.</p>
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI DELETE */}
      {confirmData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirm}
          />

          {/* card */}

              <div className="relative bg-[#0D1117] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="space-y-3 mb-6">
              <h2 className="text-2xl md:text-xl font-semibold text-white">
                Hapus Vendor?
              </h2>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus vendor{' '}
                <span className="font-semibold text-white">
                  {confirmData.name || 'ini'}
                </span>
                ? <br />
                Tindakan ini{' '}
                <span className="font-semibold">tidak dapat dibatalkan.</span>
              </p>
              {errorMsg && (
                <p className="text-xs text-red-400 mt-1">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 transition text-sm disabled:opacity-60"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
