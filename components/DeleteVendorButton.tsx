'use client'

import { useRouter } from 'next/navigation'

const API_BASE_URL = "http://localhost:5000"; // Sesuaikan port

export default function DeleteVendorButton({ id }: { id: number }) {
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah link card terklik (jika ada)
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Failed to delete");

      alert("Vendor deleted successfully");
      router.refresh(); // Refresh halaman otomatis

    } catch (error) {
      console.error(error);
      alert("Error deleting vendor");
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="absolute top-3 right-3 z-20 p-2 bg-gray-900/80 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-gray-700 hover:border-red-500"
      title="Delete Vendor"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    </button>
  )
}