'use client'

import { useRouter } from 'next/navigation'

const API_BASE_URL = "http://localhost:5000";

export default function DeletePositionButton({ id }: { id: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/positions/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        alert("Failed to delete");
        return;
      }

      alert("Position deleted");
      router.refresh(); // Refresh halaman otomatis

    } catch (error) {
      console.error(error);
      alert("Error deleting position");
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 hover:underline transition font-medium flex items-center gap-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      Delete
    </button>
  )
}