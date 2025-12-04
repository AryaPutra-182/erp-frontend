import Link from 'next/link'
import { apiGet } from '../../lib/api'

interface ManufacturingRow {
  id: number
  moNumber?: string
  quantityToProduce?: number
  status?: string; // Menambahkan status jika nanti backend mengirimnya
  product?: {
    id: number
    name: string
  }
}

export default async function ManufacturingList() {

  let manufacturing: ManufacturingRow[] = []

  try {
    manufacturing = await apiGet('/manufacturing/mo')
  } catch(e) {
    manufacturing = []
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M6 22V12c0-1.1.9-2 2-2h3"/><path d="M14 10h4a2 2 0 0 1 2 2v10"/><path d="M2 2v20"/><path d="M22 2v20"/><path d="M10 10V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><rect x="10" y="16" width="4" height="6"/></svg>
             Manufacturing Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-11">
            Track production orders and work progress.
          </p>
        </div>

        <Link
            href="/manufacturing/create"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-orange-900/20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create BOM
        </Link>
      </div>

      {/* CARD GRID */}
      {manufacturing.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161b22] border border-gray-800 border-dashed rounded-xl">
            <div className="bg-gray-800 p-4 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            </div>
            <p className="text-gray-400 text-lg font-medium">No Manufacturing Orders found</p>
            <p className="text-gray-600 text-sm mt-1">Start production by creating a new order.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {manufacturing.map((m, idx) => (
             <Link 
                href={`/manufacturing/manufacturing-order?id=${m.id}`}
                key={idx}
                className="group relative bg-[#161b22] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 flex flex-col justify-between"
             >
                {/* Header: MO Number */}
                <div className="flex justify-between items-start mb-4">
                   <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Order #</span>
                      <span className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors font-mono">
                        {m.moNumber || "MO-XXXX"}
                      </span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-orange-500 border border-gray-700 group-hover:bg-orange-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                   </div>
                </div>

                {/* Body: Product Info */}
                <div className="mb-6">
                   <p className="text-xs text-gray-500 uppercase font-bold mb-1">Product to Produce</p>
                   <h3 className="text-xl font-bold text-gray-200 line-clamp-2" title={m.product?.name}>
                      {m.product?.name || "Unknown Product"}
                   </h3>
                </div>

                {/* Footer: Qty & Status */}
                <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                   <div>
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="text-2xl font-mono font-bold text-emerald-400">
                        {m.quantityToProduce?.toFixed(0) || "0"} <span className="text-sm text-gray-500 font-sans font-normal">Units</span>
                      </p>
                   </div>

                   <span className="text-sm font-medium text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details 
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                   </span>
                </div>
             </Link>
           ))}
        </div>
      )}
    </section>
  )
}