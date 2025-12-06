'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiGet } from '../../lib/api' // Sesuaikan path

const API_BASE_URL = "http://localhost:5000";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()

  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch Detail Customer
 useEffect(() => {
  const fetchDetail = async () => {
    try {
      setLoading(true)
      
      // === PERBAIKAN DI SINI ===
      // Hapus '/api' di depan, cukup '/customers/${id}'
      // Karena apiGet sepertinya sudah otomatis menambahkan prefix /api
      const res = await apiGet<any>(`/customers/${id}`); 
      
      setCustomer(res);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
    } finally {
      setLoading(false);
    }
  }
  fetchDetail();
}, [id])

  const getAvatarUrl = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;

  if (loading) return (
    <div className="min-h-screen bg-[#0D1117] p-10 text-white flex justify-center items-center">
       <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-800 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-800 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
       </div>
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen bg-[#0D1117] p-10 text-center text-gray-500">
       Customer not found. <Link href="/customers" className="text-blue-400">Back to list</Link>
    </div>
  );

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 font-sans">
      
      {/* HEADER: Back Button & Title */}
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-4">
            <Link 
              href="/customers" 
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-gray-400"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Customer Details</h1>
         </div>

         <Link 
            href={`/customers/edit/${id}`} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Profile
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* === LEFT COLUMN: Profile Card === */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
               
               <img 
                  src={getAvatarUrl(customer.name)} 
                  alt={customer.name} 
                  className="w-32 h-32 rounded-full border-4 border-[#0D1117] shadow-xl z-10 mb-4"
               />
               
               <h2 className="text-2xl font-bold text-white mb-1">{customer.name}</h2>
               <p className="text-blue-400 font-medium mb-6">{customer.jobPosition || "No Job Title"}</p>

               <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                  <div>
                     <span className="block text-gray-500 text-xs uppercase mb-1">Status</span>
                     <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">Active</span>
                  </div>
                  <div>
                     <span className="block text-gray-500 text-xs uppercase mb-1">Customer ID</span>
                     <span className="text-gray-300 font-mono text-sm">#{customer.id}</span>
                  </div>
               </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Contact Information</h3>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="mt-1 p-2 bg-gray-800 rounded-lg text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Email Address</p>
                        <a href={`mailto:${customer.email}`} className="text-blue-400 hover:underline break-all">
                           {customer.email || "-"}
                        </a>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <div className="mt-1 p-2 bg-gray-800 rounded-lg text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Phone Number</p>
                        <span className="text-gray-300">{customer.phoneNumber || "-"}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* === RIGHT COLUMN: Company & Stats === */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Company Details */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Company Details</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Company Name</p>
                     <p className="text-gray-200 text-lg font-semibold">{customer.companyName || "-"}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Office Address</p>
                     <p className="text-gray-300 leading-relaxed">
                        {customer.companyAddress || "No address provided."}
                     </p>
                  </div>
               </div>
            </div>

            {/* Transaction History (Placeholder / Future Feature) */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Last 30 Days</span>
               </div>
               
               {/* Contoh Mockup Data Transaksi Kosong */}
               <div className="text-center py-10 border border-gray-800 border-dashed rounded-xl bg-[#0D1117]/50">
                  <p className="text-gray-500 mb-2">No transactions found for this customer.</p>
                  <Link href="/sales/create" className="text-sm text-blue-500 hover:underline">
                     + Create Sales Order
                  </Link>
               </div>
            </div>

         </div>

      </div>
    </section>
  )
}