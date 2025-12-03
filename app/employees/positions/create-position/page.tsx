"use client";

import { useState } from "react";
import { apiPost } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function CreatePositionPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Position name is required");

    try {
      await apiPost("/positions", { name });
      router.push("/employees/positions");
    } catch {
      alert("Failed to create position");
    }
  };

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Create Job Position</h1>

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

      {/* FORM */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <label className="block text-sm text-gray-300 mb-1">Position Name *</label>
        <input
          type="text"
          placeholder="Example: Manager, Staff, Supervisor"
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:border-cyan-400 transition"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

    </div>
  );
}
