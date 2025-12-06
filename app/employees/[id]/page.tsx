'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../../lib/api' // Sesuaikan path jika perlu

const API_BASE_URL = "http://localhost:5000";

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        
        // === PERBAIKAN DI SINI ===
        // Hapus '/api' di depan. Cukup '/employees/${id}'
        const data = await apiGet<any>(`/employees/${id}`); 
        
        setEmployee(data);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // --- HELPER FOTO ---
  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return null;
    let cleanPath = photoPath.replace(/\\/g, "/");
    // Hapus prefix 'uploads/' jika double (jaga-jaga)
    if (cleanPath.startsWith("uploads/")) cleanPath = cleanPath.replace("uploads/", "");
    
    // Sesuaikan dengan static folder di server.js (app.use('/uploads', ...))
    return `${API_BASE_URL}/uploads/${cleanPath}`;
  };

  // --- LOADING STATE ---
  if (loading) return (
    <div className="min-h-screen bg-[#0D1117] p-10 flex justify-center items-center">
       <div className="text-gray-500 animate-pulse">Loading Employee Profile...</div>
    </div>
  );

  // --- NOT FOUND STATE ---
  if (!employee) return (
    <div className="min-h-screen bg-[#0D1117] p-10 text-center text-gray-500">
       Employee not found. <Link href="/employees" className="text-blue-400">Back to directory</Link>
    </div>
  );

  const photoUrl = getPhotoUrl(employee.photo);

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-4">
            <Link 
              href="/employees" 
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-gray-400"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Employee Profile</h1>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* === LEFT COLUMN: Photo & Main Info === */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
               
               {/* Background Decoration */}
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
               
               {/* PHOTO PROFILE */}
               <div className="w-40 h-40 rounded-full border-4 border-[#0D1117] bg-gray-800 shadow-xl z-10 mb-4 overflow-hidden relative flex items-center justify-center">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={employee.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
               </div>
               
               <h2 className="text-2xl font-bold text-white mb-1 z-10">{employee.name}</h2>
               <p className="text-blue-400 font-medium mb-6 z-10">{employee.Position?.name || "No Position"}</p>

               <div className="w-full border-t border-gray-800 pt-6">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-gray-500 text-sm">Status</span>
                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Active</span>
                  </div>
               </div>
            </div>
         </div>

         {/* === RIGHT COLUMN: Detailed Info === */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* General Information */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  General Information
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {/* Email */}
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email Address</p>
                     <div className="flex items-center gap-2 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <a href={`mailto:${employee.email}`} className="hover:text-blue-400 transition">{employee.email}</a>
                     </div>
                  </div>

                  {/* Phone */}
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone Number</p>
                     <div className="flex items-center gap-2 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>{employee.phone || "-"}</span>
                     </div>
                  </div>

                  {/* Department */}
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Department</p>
                     <p className="text-gray-300 font-medium">
                        {employee.Department?.name || "Unassigned"}
                     </p>
                  </div>

                  {/* Position */}
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Current Position</p>
                     <p className="text-gray-300 font-medium">
                        {employee.Position?.name || "Unassigned"}
                     </p>
                  </div>
               </div>
            </div>

            {/* Created Info (Metadata) */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div>
                        Joined: <span className="text-gray-400">{new Date(employee.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                    <div>
                        Last Updated: <span className="text-gray-400">{new Date(employee.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

         </div>
      </div>
    </section>
  )
}