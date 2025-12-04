import Link from 'next/link'
import { apiGet } from '../lib/api'

interface ManufacturingRow {
  id: string;
  reference: string;
  product?: {
    id: number;
    name: string;
    internalReference?: string; // Optional: Jika ada kode produk
  }
  // Tambahkan field lain jika ada (misal: quantity, unit, dll)
}

export default async function ManufacturingPage() {
  
  let manufacturing: ManufacturingRow[] = []

  try {
    manufacturing = await apiGet<any>('/manufacturing-materials')
  } catch(e) {
    manufacturing = []
  }

  // Grouping Logic (Tetap dipertahankan)
  const grouped = manufacturing.reduce((acc: Record<string, ManufacturingRow>, item) => {
    const key = `${item.id}-${item.product?.name}-${item.reference}`;
    if (!acc[key]) acc[key] = item;
    return acc;
  }, {});

  const uniqueRows: ManufacturingRow[] = Object.values(grouped);

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
             Bills of Material (BOM)
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-11">
            Manage product recipes and component structures.
          </p>
        </div>
      
        <div className="flex gap-3">
          <Link
            href="/manufacturing/mo-list"
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            MO List
          </Link>

          <Link
            href="/manufacturing/create"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create BOM
          </Link>
        </div>
      </div>

      {/* CARD GRID */}
      {uniqueRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161b22] border border-gray-800 border-dashed rounded-xl">
            <div className="bg-gray-800 p-4 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <p className="text-gray-400 text-lg font-medium">No BOMs found</p>
            <p className="text-gray-600 text-sm mt-1">Create a new Bill of Material to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {uniqueRows.map((m, idx) => (
             <Link 
               href={`/manufacturing/manufacturing-order?ref=${m.reference}`}
               key={idx}
               className="group relative bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 block"
             >
                {/* Header: Reference Badge */}
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                   </div>
                   <span className="text-xs font-mono font-bold text-gray-500 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                      {m.reference}
                   </span>
                </div>

                {/* Body: Product Name */}
                <div className="mb-4">
                   <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2" title={m.product?.name}>
                      {m.product?.name || "Unknown Product"}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                      BOM Structure for {m.product?.name}
                   </p>
                </div>

                {/* Footer: Action Hint */}
                <div className="border-t border-gray-800 pt-3 mt-auto flex items-center justify-between">
                   <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                   </span>
                   <span className="text-xs text-blue-400 font-medium group-hover:underline">
                      View Components →
                   </span>
                </div>
             </Link>
           ))}
        </div>
      )}
    </section>
  );
}