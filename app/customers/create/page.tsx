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
    <div className="min-h-[80vh]">
      
      {/* HEADER */}
     
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-white-300">Sales</h2>

        <button
          onClick={() =>
            document.querySelector("form")?.dispatchEvent(
              new Event("submit", { bubbles: true, cancelable: true })
            )
          }
          className="px-5 py-2 rounded-full bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition"
        >
          Save
        </button>
      </div>

      {/* UBAH LEBAR DI SINI */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">

        {/* UBAH LEBAR CARD DI SINI */}
        <div className="bg-slate-900 p-7 rounded-2xl shadow-xl border border-slate-800 max-w-5xl mx-auto">

          <h3 className="text-cyan-200 font-semibold mb-5 border-b border-slate-800 pb-2 text-lg">
            Tambah Customer Baru
          </h3>

          <div className="flex gap-8">

            {/* LEFT FORM */}
            <div className="flex-1 grid grid-cols-1 gap-4">

              <div>
                <label className="text-sm text-slate-300">Customer Name</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Customer Info</label>
                <textarea
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  rows={2}
                  placeholder="Customer details..."
                  value={form.customerInfo}
                  onChange={(e) => setForm({ ...form, customerInfo: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Company Name</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Company"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Company Address</label>
                <textarea
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  rows={2}
                  placeholder="Company address"
                  value={form.companyAddress}
                  onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300">Phone Number</label>
                  <input
                    className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                    placeholder="0812..."
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Job Position</label>
                <input
                  className="w-full mt-1 px-3 py-3 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  placeholder="Job title"
                  value={form.jobPosition}
                  onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
                />
              </div>

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

            {/* IMAGE SIDE */}
            <div className="w-48 flex flex-col items-center">
              <div className="w-36 h-36 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-sm">No Image</span>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />

              <button
                type="button"
                className="mt-3 px-4 py-2 rounded bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition"
                onClick={triggerFile}
              >
                Upload
              </button>

              {imagePreview && (
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded bg-slate-800 text-cyan-200 border border-slate-700 hover:bg-slate-700 transition"
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

        </div>
      </form>
    </div>
  );
}
