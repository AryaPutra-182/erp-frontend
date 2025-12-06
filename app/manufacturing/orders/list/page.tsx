import Link from 'next/link'
import { apiGet } from '../../../lib/api'

// Helper untuk warna status
const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'done' || s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (s === 'in progress' || s === 'work in progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (s === 'confirmed') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (s === 'cancelled') return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-gray-700/50 text-gray-400 border-gray-600'; // Draft/Default
}

// Helper format tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default async function ManufacturingListPage() {
  let manufacturing: any[] = []
  
  try {
    const response = await apiGet<any>('/manufacturing/mo');
    // Handle berbagai format response backend (array langsung atau object dengan rows/data)
    manufacturing = Array.isArray(response) ? response : (response?.rows || response?.data || []);
  } catch(e) { 
    manufacturing = [] 
  }
  
  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg shadow-lg shadow-orange-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
             </span>
             Manufacturing Orders
          </h1>
          <p className="text-gray-400 text-sm mt-2 ml-1">Track production, work orders, and BOM status.</p>
        </div>
        
        <Link 
          href="/manufacturing/orders/create" 
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-orange-900/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Order
        </Link>
      </div>

      {/* LIST CONTENT */}
      {manufacturing.length === 0 ? (
        // EMPTY STATE
        <div className="flex flex-col items-center justify-center py-20 border border-gray-800 border-dashed rounded-2xl bg-[#161b22]/50">
           <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No Manufacturing Orders</h3>
           <p className="text-gray-500 mb-6">Start by creating a new production plan.</p>
           <Link href="/manufacturing/orders/create" className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              + Create your first MO
           </Link>
        </div>
      ) : (
        // GRID CARD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {manufacturing.map((m: any, idx: number) => (
             <Link 
                href={`/manufacturing/orders/${m.id}`} 
                key={idx} 
                className="group flex flex-col justify-between bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-900/10 transition-all duration-300 hover:-translate-y-1"
             >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-orange-900/20 group-hover:text-orange-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/></svg>
                      </div>
                      <span className="font-mono text-sm text-gray-500 font-bold group-hover:text-white transition-colors">
                        {m.moNumber}
                      </span>
                   </div>
                   
                   {/* Status Badge */}
                   <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusBadge(m.status)}`}>
                      {m.status || 'Draft'}
                   </span>
                </div>

                {/* Card Body */}
                <div className="mb-4">
                   <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={m.product?.name}>
                      {m.product?.name || "Unknown Product"}
                   </h3>
                   <p className="text-xs text-gray-500">
                      Product ID: {m.productId || '-'}
                   </p>
                </div>

                {/* Card Footer / Stats */}
                <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                   <div>
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                         {Number(m.quantityToProduce).toFixed(0)} <span className="text-sm font-normal text-gray-500">Unit</span>
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-xs font-mono text-gray-300">
                         {formatDate(m.createdAt)}
                      </p>
                   </div>
                </div>
             </Link>
           ))}
        </div>
      )}
    </section>
  );
}