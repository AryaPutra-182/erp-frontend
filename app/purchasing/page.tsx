import Link from 'next/link'
import { apiGet } from '../lib/api' // Pastikan path ini benar
// Hapus import RFQ type jika bikin error, kita pakai any dulu biar aman
// import { RFQ } from '../../types' 

export default async function PurchasingPage() {

  let rfqs: any[] = []

  try { 
    // PERBAIKAN DI SINI: 
    // Ubah endpoint dari '/purchase/rfq-list' menjadi '/purchasing'
    // Sesuai dengan route baru yang kita buat tadi.
    const response = await apiGet<any>('/purchasing');
    
    // Handle format response { success: true, data: [] } atau array langsung
    rfqs = Array.isArray(response) ? response : (response.data || []);
    
    // Debugging (Cek terminal Next.js Anda)
    console.log("DATA PO DARI API:", rfqs); 

  } catch(e) { 
    console.error("Gagal load PO:", e);
    rfqs = [] 
  }

  // Helper Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  }

  // Helper Status Color
  const getStatusColor = (status: any) => {
      const s = String(status || "").toLowerCase();
      if(s === "done" || s === "received") return "text-emerald-400 bg-emerald-900/20 border-emerald-800";
      if(s === "purchase order" || s.includes("po")) return "text-blue-400 bg-blue-900/20 border-blue-800"; // Warna untuk PO
      if(s.includes("cancel")) return "text-red-400 bg-red-900/20 border-red-800";
      return "text-yellow-400 bg-yellow-900/20 border-yellow-800"; // Draft
  }

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#0D1117] text-gray-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <h1 className="text-3xl font-bold text-white tracking-tight">Purchasing</h1>
           </div>
           <p className="text-gray-400 text-sm ml-11">Purchase Orders and Vendor Bills.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/purchasing/vendors" 
            className="px-5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-gray-700 rounded-lg transition font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8H7v8"/></svg>
            Vendors
          </Link>
          
          <Link 
            href="/purchasing/create" 
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Purchase Order
          </Link>
        </div>
      </div>

      {/* CONTENT SECTION */}
      {rfqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#161b22] border border-dashed border-gray-800 rounded-2xl">
            <div className="bg-gray-800 p-4 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-300">No Purchase Orders Found</h3>
            <p className="text-gray-500 text-sm mb-6 mt-2">Start by creating your first Purchase Order.</p>
            <Link 
              href="/purchasing/create" 
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
            >
              Create New &rarr;
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfqs.map((r, idx) => {
                // Hitung Total jika backend belum menyediakan
                // Jika r.items ada, hitung dari items. Jika tidak, pakai r.total atau 0
                const calculatedTotal = r.total || (r.RFQItems?.reduce((a:number, b:any) => a + (Number(b.qty)*Number(b.price)), 0)) || 0;

                return (
                <Link 
                    href={`/purchasing/rfq/${r.id}`} 
                    key={r.id || idx}
                    className="group flex flex-col bg-[#161b22] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/10 transition"></div>

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">
                                Reference
                            </span>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition font-mono">
                                {r.rfqNumber || "DRAFT"}
                            </h3>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getStatusColor(r.status)}`}>
                            {r.status || "Draft"}
                        </span>
                    </div>

                    <div className="h-px bg-gray-800 w-full mb-6"></div>

                    {/* Vendor Info */}
                    <div className="mb-6 flex-grow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-gray-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8H7v8"/></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Vendor</p>
                                <p className="text-gray-200 font-medium truncate w-40">
                                    {r.Vendor?.vendorName || "Unknown Vendor"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-800">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total</p>
                            <p className="text-xl font-bold text-emerald-400 font-mono">
                                {formatRupiah(Number(calculatedTotal))}
                            </p>
                        </div>
                        <span className="text-sm text-gray-500 group-hover:text-white flex items-center gap-1 transition">
                            Details <span className="text-lg">→</span>
                        </span>
                    </div>
                </Link>
            )})}
        </div>
      )}
    </section>
  )
}