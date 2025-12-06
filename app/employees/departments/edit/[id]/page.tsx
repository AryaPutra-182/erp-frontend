"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "../../../../lib/api"; // Sesuaikan jumlah '../' dengan struktur foldermu

// URL Backend
const API_BASE_URL = "http://localhost:5000";

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // State Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [parentId, setParentId] = useState("");

  // Data List untuk Dropdown
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // 1. Fetch Data Awal (Load Data Lama + Dropdown)
  // 1. Fetch Data Awal (Load Data Lama + Dropdown)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // === PERBAIKAN DI SINI (Hapus '/api' di depan) ===
        const [empRes, deptRes] = await Promise.all([
            apiGet<any[]>("/employees").catch(() => []), // Cukup '/employees'
            apiGet<any[]>("/departments").catch(() => []) // Cukup '/departments'
        ]);
        setEmployees(empRes || []);
        setDepartments(deptRes || []);

        // Ambil Detail Dept (Hapus '/api' juga)
        const currentDept = await apiGet<any>(`/departments/${id}`);
        
        if (currentDept) {
            setName(currentDept.name);
            setDescription(currentDept.description || "");
            // Pastikan nilai null diubah jadi string kosong ""
            setManagerId(currentDept.managerId || "");
            setParentId(currentDept.parentId || "");
        }

      } catch (err) {
        console.error("Failed to load data", err);
        alert("Gagal mengambil data departemen. Pastikan Server Jalan & URL Benar.");
        // router.push("/employees/departments"); // Opsional: Jangan redirect dulu biar bisa liat errornya
      } finally {
        setLoading(false);
      }
    };
    
    // Pastikan ID ada sebelum fetch
    if (id) {
        loadData();
    }
  }, [id, router]);

  // 2. Handle Submit Update
  const handleUpdate = async () => {
    if (!name.trim()) return alert("Department name is required");

    // Validasi Client Side: Parent tidak boleh diri sendiri
    if (parentId && String(parentId) === String(id)) {
        return alert("A department cannot be its own parent.");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            description,
            // Ubah string kosong "" jadi null agar database tidak error
            managerId: managerId || null,
            parentId: parentId || null
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update");
      }

      alert("Department updated successfully");
      router.push("/employees/departments"); // Kembali ke list
      router.refresh(); // Refresh agar data terbaru muncul

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 text-white text-center">Loading Data...</div>;

return (
    // Tambahkan min-h-screen dan hapus mt-10 agar menempel rapi ke atas (sesuai layout)
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      <div className="bg-[#161b22] border border-gray-800 rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
        
        {/* TITLE + ACTIONS */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Department
          </h1>

          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition font-medium text-white shadow-lg shadow-blue-900/20"
            >
              Update Changes
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-700 grid gap-6">

          {/* Department Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Department Name *</label>
            <input
              type="text"
              className="w-full p-2.5 bg-[#161b22] border border-gray-600 rounded focus:border-blue-500 outline-none transition text-white placeholder-gray-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              className="w-full p-2.5 bg-[#161b22] border border-gray-600 rounded focus:border-blue-500 outline-none transition text-white h-24 resize-none placeholder-gray-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the department's function..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manager */}
              <div>
              <label className="block text-sm text-gray-400 mb-1">Manager</label>
              <select
                  className="w-full p-2.5 bg-[#161b22] border border-gray-600 rounded focus:border-blue-500 outline-none transition text-white"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
              >
                  <option value="">-- No Manager --</option>
                  {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
              </select>
              </div>

              {/* Parent Department */}
              <div>
              <label className="block text-sm text-gray-400 mb-1">Parent Department</label>
              <select
                  className="w-full p-2.5 bg-[#161b22] border border-gray-600 rounded focus:border-blue-500 outline-none transition text-white"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
              >
                  <option value="">-- Root Level (No Parent) --</option>
                  {departments
                      .filter(d => String(d.id) !== String(id)) 
                      .map((dep) => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Current department is hidden from this list.</p>
              </div>
          </div>

        </div>
      </div>
    </section>
  ); }