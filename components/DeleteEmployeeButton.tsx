'use client'

export default function DeleteEmployeeButton({ id }: { id: number }) {

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // ❗ supaya tidak redirect ke detail saat klik
    e.stopPropagation(); // ❗ cegah klik bubble ke parent Link

    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete employee");

      alert("Employee deleted successfully");

      // refresh page
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-xs shadow-lg z-20"
    >
      🗑
    </button>
  );
}
