'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import Pagination from '../../components/Pagination'

const API_BASE_URL = "http://localhost:5000";

type ConfirmState = {
  open: boolean
  id: number | null
  name: string
}

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [customers, setCustomers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const [confirmData, setConfirmData] = useState<ConfirmState>({
    open: false,
    id: null,
    name: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const page = Number(searchParams.get('page') || 1)

  // --- FETCHING KEMBALI SEPERTI ASAL ---
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)

      const res = await apiGet<any>(
        `/customers?page=${page}&q=${encodeURIComponent(searchTerm)}`
      );

      const data = res?.rows || res?.data || res || [];
      const totalCount = res?.count ?? data.length ?? 0;

      setCustomers(Array.isArray(data) ? data : []);
      setTotal(totalCount);

    } catch (error) {
      console.error("Fetch failed:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --- BUKA MODAL KONFIRMASI ---
  const openConfirmDelete = (
    e: React.MouseEvent,
    id: number,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmData({
      open: true,
      id,
      name,
    });
    setErrorMsg(null);
  };

  // --- TUTUP MODAL ---
  const closeConfirm = () => {
    if (isDeleting) return;
    setConfirmData(prev => ({ ...prev, open: false }));
    setErrorMsg(null);
  };

  // --- EKSEKUSI DELETE SETELAH KONFIRMASI ---
  const handleConfirmDelete = async () => {
    if (!confirmData.id) return;

    try {
      setIsDeleting(true);
      setErrorMsg(null);

      const res = await fetch(`${API_BASE_URL}/api/customers/${confirmData.id}`, {
        method: 'DELETE'
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result?.msg || "Cannot delete customer");
        return;
      }

      // Update list & total
      setCustomers(prev => prev.filter(c => c.id !== confirmData.id));
      setTotal(prev => prev - 1);

      // Tetap pakai replace seperti semula
      router.replace(`/customers?page=${page}&q=${encodeURIComponent(searchTerm)}`);

      // Tutup modal
      setConfirmData(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error deleting customer");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/customers?page=1&q=${encodeURIComponent(searchTerm)}`);
  };

  const getAvatarUrl = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="p-2 bg-blue-600 rounded-lg">👥</span>
          Customers
        </h1>

        <Link href="/customers/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">
          + Add Customer
        </Link>
      </div>

      <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">

        <form onSubmit={handleSearch} className="p-4 border-b border-gray-800 flex justify-between">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-72 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-sm"
          />
          <span className="text-gray-500 text-sm">Total: {total}</span>
        </form>

        {loading ? (
          <div className="p-6">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No customers found.</div>
        ) : (
          <table className="w-full">
            <thead className="text-gray-400 text-xs bg-gray-800">
              <tr>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4">Company</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/30">
                  <td className="p-4 flex items-center gap-3">
                    <img src={getAvatarUrl(c.name)} className="w-10 h-10 rounded-full border border-gray-700" />
                    <div>
                      {/* Klik nama -> Masuk Detail */}
                      <Link href={`/customers/${c.id}`} className="font-semibold text-white hover:text-blue-400">
                        {c.name}
                      </Link>
                      <span className="block text-xs text-gray-500">{c.email}</span>
                    </div>
                  </td>

                  <td className="text-center text-gray-400">{c.companyName || "-"}</td>
                  <td className="text-center text-gray-400">{c.phoneNumber || "-"}</td>

               <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* Tetap sama: icon view detail */}
                      <Link
                        href={`/customers/${c.id}`}
                        className="px-2 py-1 text-blue-400 hover:text-white"
                        title="View Detail"
                      >
                        👁️
                      </Link>
                      
                      {/* Delete sekarang buka modal, UI tombol tetap sama */}
                      <button
                        onClick={(e) => openConfirmDelete(e, c.id, c.name)}
                        className="px-2 py-1 text-red-400 hover:text-white"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {customers.length > 0 && (
          <div className="p-4 border-t border-gray-800 flex justify-center">
            <Pagination page={page} total={total} baseUrl="/customers" />
          </div>
        )}
      </div>

      {/* === POPUP KONFIRMASI DELETE === */}
      {confirmData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirm}
          />

          {/* CARD KECIL (SAMA STYLE DENGAN HALAMAN LAIN) */}
          <div className="relative bg-[#0D1117] border border-gray-700 rounded-xl p-5 w-full max-w-sm shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Hapus Customer?
            </h3>

            <p className="text-sm text-gray-300 mb-4">
              Yakin ingin menghapus{" "}
              <span className="font-semibold text-white">
                {confirmData.name}
              </span>?  
              <br />Aksi ini tidak dapat dibatalkan.
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
  );
}
