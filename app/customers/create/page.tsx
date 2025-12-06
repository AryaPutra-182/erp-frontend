'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';
import { useToast } from '../../../components/ToastProvider';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { push } = useToast();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    customerInfo: "",
    companyName: "",
    companyAddress: "",
    email: "",
    phoneNumber: "",
    jobPosition: "",
    status: "Active",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const triggerFile = () => fileRef.current?.click();

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (f) setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name.trim()) {
      push("Name is required", "error");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("customerInfo", form.customerInfo);
      fd.append("companyName", form.companyName);
      fd.append("companyAddress", form.companyAddress);
      fd.append("email", form.email);
      fd.append("phoneNumber", form.phoneNumber);
      fd.append("jobPosition", form.jobPosition);
      fd.append("status", form.status);
      if (imageFile) fd.append("imageProfile", imageFile);

      const API = "http://localhost:5000/api";

      const res = await fetch(`${API}/customers`, {
        method: "POST",
        body: fd,
      });


      if (!res.ok) throw new Error("Failed to save");

      push("Customer created successfully!", "success");
      router.push("/customers");
    } catch (err: any) {
      push("Failed to create customer: " + err.message, "error");
    }
  };

  return (
    <div className="bg-[#0D1117] text-white p-8 rounded-xl shadow-xl border border-gray-800 max-w-5xl mx-auto">

      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Customer</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-10">

        {/* LEFT SECTION */}
        <div className="col-span-2 space-y-5">

          <div>
            <label className="block text-sm text-gray-300 mb-1">Customer Name</label>
            <input
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Customer Info</label>
            <textarea
              rows={2}
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              placeholder="Customer details..."
              value={form.customerInfo}
              onChange={(e) => setForm({ ...form, customerInfo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Company Name</label>
            <input
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Company Address</label>
            <textarea
              rows={2}
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
              <input
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Job Position</label>
            <input
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.jobPosition}
              onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Status</label>
            <select
              className="w-full bg-gray-900 px-3 py-2 rounded border border-gray-700 focus:border-cyan-400 transition"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Active</option>
              <option>Archived</option>
            </select>
          </div>

        </div>

        {/* IMAGE UPLOADER */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-40 h-40 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Image</span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />

          <button
            type="button"
            className="mt-3 px-4 py-2 rounded bg-cyan-500 text-black hover:bg-cyan-400 transition"
            onClick={triggerFile}
          >
            Upload
          </button>

          {imagePreview && (
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Remove
            </button>
          )}
        </div>
      </form>

      <div className="mt-10 flex justify-end">
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg shadow hover:scale-105 transition transform"
          type="submit"
          onClick={() =>
            document
              .querySelector("form")
              ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
          }
        >
          Submit
        </button>
      </div>
    </div>
  );
}