"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function CreateDepartmentPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [parentId, setParentId] = useState("");

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Load dropdown data
  useEffect(() => {
    const load = async () => {
      try { setEmployees(await apiGet("/employees")); } catch {}
      try { setDepartments(await apiGet("/departments")); } catch {}
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Department name is required");

    try {
      await apiPost("/departments", {
        name,
        managerId: managerId || null,
        parentId: parentId || null,
      });

      router.push("/employees/departments");
    } catch (err) {
      console.error(err);
      alert("Failed to create department");
    }
  };

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-4xl mx-auto">
      
      {/* TITLE + ACTIONS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Create Department</h1>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Discard
          </button>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 grid gap-6">

        {/* Department Name */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Department Name *</label>
          <input
            type="text"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:border-cyan-400 transition"
            placeholder="Example: Finance, Production, HR"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Manager */}
        <div>
          <div className="flex justify-between">
            <label className="block text-sm text-gray-300 mb-1">Department Manager (Optional)</label>
          </div>

          <select
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:border-cyan-400 transition"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">-- No Manager Assigned --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          {employees.length === 0 && (
            <p className="text-yellow-400 text-xs mt-1">
              Belum ada employee — manager dapat ditetapkan nanti.
            </p>
          )}
        </div>

        {/* Parent Department */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Parent Department (Optional)</label>

          <select
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:border-cyan-400 transition"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">-- None (Root Department) --</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>

          {departments.length === 0 && (
            <p className="text-gray-400 text-xs mt-1">
              Tidak ada parent department — ini akan menjadi department utama.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
