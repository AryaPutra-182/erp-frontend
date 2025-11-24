'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';
import { useToast } from '../../../components/ToastProvider';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { push } = useToast();

  const fileRef = useRef<HTMLInputElement | null>(null);

  // STATE FORM SESUAI SCHEMA
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

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"contact" | "sales" | "invoicing">("contact");

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
      setLoading(true);

      // MULTIPART POST (WITH PHOTO)
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

      const API = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${API}/customers`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to save");

      push("Customer created successfully!", "success");
      router.push("/customers");
    } catch (err: any) {
      push("Failed to create customer: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* --- HEADER BUTTONS --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-cyan-300 font-semibold text-xl">Sales</h2>

        <div className="flex gap-3">
          <button className="px-5 py-1 rounded-full bg-slate-800 text-cyan-200 border border-slate-700">
            Discard
          </button>

          <button
            onClick={() => document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))}
            className="px-5 py-1 rounded-full bg-cyan-500 text-slate-900 font-bold"
          >
            Save
          </button>

          <button className="px-5 py-1 rounded-full bg-slate-800 text-cyan-200 border border-slate-700">
            Edit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* --- MAIN CARD --- */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-700">
          <h3 className="text-cyan-200 font-semibold mb-4">New Customer</h3>

          <div className="flex gap-6">

            {/* LEFT SIDE FORM */}
            <div className="flex-1 grid grid-cols-1 gap-3">

              {/* NAME */}
              <div>
                <label className="text-sm text-slate-300">Customer Name</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* CUSTOMER INFO */}
              <div>
                <label className="text-sm text-slate-300">Customer Info</label>
                <textarea
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  rows={2}
                  placeholder="Additional customer information..."
                  value={form.customerInfo}
                  onChange={(e) => setForm({ ...form, customerInfo: e.target.value })}
                ></textarea>
              </div>

              {/* COMPANY NAME */}
              <div>
                <label className="text-sm text-slate-300">Company Name</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Company"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>

              {/* COMPANY ADDRESS */}
              <div>
                <label className="text-sm text-slate-300">Company Address</label>
                <textarea
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  rows={2}
                  placeholder="Company address"
                  value={form.companyAddress}
                  onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                ></textarea>
              </div>

              {/* PHONE + EMAIL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300">Phone Number</label>
                  <input
                    className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                    placeholder="0812..."
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* JOB POSITION */}
              <div>
                <label className="text-sm text-slate-300">Job Position</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Job title"
                  value={form.jobPosition}
                  onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="text-sm text-slate-300">Status</label>
                <select
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Archived</option>
                </select>
              </div>

            </div>

            {/* RIGHT SIDE - IMAGE UPLOAD */}
            <div className="w-48 flex flex-col items-center">
              <div className="w-36 h-36 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-sm">No Image</span>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />

              <button
                type="button"
                className="mt-3 px-4 py-1 rounded bg-cyan-500 text-slate-900"
                onClick={triggerFile}
              >
                Upload
              </button>

              {imagePreview && (
                <button
                  type="button"
                  className="mt-2 px-4 py-1 rounded bg-slate-700 text-cyan-200 border border-slate-600"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* --- TABS (Optional UI, kept for design) --- */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex gap-3">
              <button type="button" onClick={() => setTab("contact")}
                className={`px-4 py-1 rounded-full ${tab === "contact" ? "bg-cyan-600 text-slate-900" : "bg-slate-800 text-cyan-200"}`}>
                Contact & Address
              </button>

              <button type="button" onClick={() => setTab("sales")}
                className={`px-4 py-1 rounded-full ${tab === "sales" ? "bg-cyan-600 text-slate-900" : "bg-slate-800 text-cyan-200"}`}>
                Sales & Purchase
              </button>

              <button type="button" onClick={() => setTab("invoicing")}
                className={`px-4 py-1 rounded-full ${tab === "invoicing" ? "bg-cyan-600 text-slate-900" : "bg-slate-800 text-cyan-200"}`}>
                Invoicing
              </button>
            </div>

            <div className="text-slate-400 mt-4 text-sm">
              (Optional section – placeholder sesuai UI desain Anda)
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
