'use client'

import { useRouter } from 'next/navigation'

const API_BASE_URL = "http://localhost:5000"; // Sesuaikan

export default function DeleteDepartmentButton({ id }: { id: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
        method: 'DELETE'
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to delete");
        return;
      }

      alert("Department deleted");
      router.refresh(); // Refresh halaman otomatis

    } catch (error) {
      console.error(error);
      alert("Error deleting department");
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 hover:underline transition"
    >
      Delete
    </button>
  )
}