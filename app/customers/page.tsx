import Link from 'next/link';
import { apiGet } from '../lib/api';
// Hapus LoadingSkeleton dari sini. Loading state di Next.js App Router
// sebaiknya ditangani oleh file `loading.tsx` di folder yang sama.
// import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
// Kita tidak memakai Table generik lagi, kita buat tabel custom di sini
// import Table from '../../components/Table';
import { Customer } from '../../types';

export default async function CustomersPage({ searchParams }: { searchParams?: any }) {
  const page = Number(searchParams?.page || 1);
  const q = searchParams?.q || '';

  let customers: Customer[] = [];
  let total = 0;

  try {
    // Anggap respon API Anda bentuknya { rows: [], count: 0 } atau array langsung
    const res = await apiGet<any>(`/customers?page=${page}&q=${encodeURIComponent(q)}`);
    customers = res.rows || res || [];
    total = res.count ?? customers.length ?? 0;
  } catch (e) {
    console.error("Failed to fetch customers:", e);
    customers = [];
    total = 0;
  }

  // --- Helper untuk membuat URL Avatar ---
  const getAvatarUrl = (name: string) => {
    // Menggunakan layanan UI Avatars untuk membuat inisial gambar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {/* Icon Users */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Customers
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-11">
            Manage your client base and contact details.
          </p>
        </div>

        {/* Add Button */}
        <Link
          href="/customers/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Customer
        </Link>
      </div>

      {/* --- MAIN CONTENT BOX --- */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Search Bar Toolbar */}
        <div className="p-4 border-b border-gray-800 bg-[#161b22]/50 flex justify-between items-center flex-wrap gap-4">
          <form action="/customers" method="get" className="relative w-full md:w-96">
             {/* Search Icon Absolute */}
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search customers by name..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0D1117] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-200 placeholder-gray-500"
            />
            {/* Hidden submit button for 'Enter' key press */}
            <button type="submit" className="hidden">Search</button>
          </form>

          <div className="text-sm text-gray-400 font-mono bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
            Total count: <span className="text-white font-bold">{total}</span>
          </div>
        </div>

        {/* --- CUSTOMERS TABLE WITH AVATARS --- */}
        {customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800/70 text-gray-400 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-5">Customer Name</th>
                  <th className="p-5">Company</th>
                  <th className="p-5">Phone Number</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {customers.map((c, index) => (
                  <tr key={c.id || index} className="hover:bg-gray-800/30 transition-colors group">
                    {/* Cell 1: Avatar & Name & Email */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        {/* AVATAR IMAGE */}
                        <img 
                          src={getAvatarUrl(c.name)} 
                          alt={c.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-700 group-hover:border-blue-500 transition-colors object-cover"
                        />
                        <div>
                          <p className="font-bold text-white text-base">{c.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            {/* Email Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            {c.email || "No email provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cell 2: Company */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-300">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                         {c.companyName || "-"}
                      </div>
                    </td>

                     {/* Cell 3: Phone */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-300 font-mono text-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                         {c.phoneNumber || "-"}
                      </div>
                    </td>

                    {/* Cell 4: Actions */}
                    <td className="p-5 text-right">
                      <Link href={`/customers/${c.id}`} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-md">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="bg-gray-800 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="22" y2="11"/><line x1="18" y1="11" x2="18" y2="11"/><line x1="14" y1="11" x2="14" y2="11"/></svg>
              </div>
              <p className="text-lg font-medium text-gray-300">No customers found</p>
              <p className="text-sm">Try adjusting your search or add a new customer.</p>
          </div>
        )}

        {/* --- FOOTER & PAGINATION --- */}
        {customers.length > 0 && (
           <div className="p-4 border-t border-gray-800 bg-[#161b22]/50 flex justify-center">
              <Pagination page={page} total={total} baseUrl="/customers" />
           </div>
        )}
      </div>
    </section>
  );
}