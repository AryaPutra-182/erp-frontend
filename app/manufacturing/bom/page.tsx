import Link from 'next/link'
import { apiGet } from '../../lib/api'

interface BOMRecipe {
  reference: string;
  productId: number;
  product?: { name: string; internalReference?: string; };
}

export default async function BOMListPage() {
  let boms: BOMRecipe[] = []
  try {
    const response = await apiGet<any>('/manufacturing-materials'); 
    const grouped = (response.rows || response || []).reduce((acc: Record<string, BOMRecipe>, item: any) => {
        const key = item.reference;
        if (!acc[key]) acc[key] = item;
        return acc;
    }, {});
    boms = Object.values(grouped);
  } catch(e) { 
    console.error("Failed load BOM list:", e);
    boms = []
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bills of Material (BOM)</h1>
          <p className="text-gray-400 text-sm mt-1">Product recipes and component structures.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/manufacturing/orders/list" className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-gray-700 rounded-lg transition-all">MO List</Link>
          <Link href="/manufacturing/bom/create" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg">+ Create BOM</Link>
        </div>
      </div>

      {boms.length === 0 ? (
        <div className="text-center py-20 border border-gray-800 border-dashed rounded-xl"><p className="text-gray-400">No BOMs found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {boms.map((m, idx) => (
             <div key={idx} className="relative bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1">
                {/* LINK OVERLAY (AGAR BISA DIKLIK AMAN) */}
                <Link href={`/manufacturing/orders/new?ref=${m.reference}`} className="absolute inset-0 z-20"></Link>

                <div className="mb-4"><span className="text-xs font-mono font-bold text-gray-500 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">{m.reference}</span></div>
                <div className="mb-4"><h3 className="text-lg font-bold text-white">{m.product?.name || "Unknown"}</h3><p className="text-sm text-gray-500">Target Product</p></div>
                <div className="border-t border-gray-800 pt-3 mt-auto flex items-center justify-between">
                   <span className="text-xs text-emerald-500 font-medium">Active</span>
                   <span className="text-xs text-blue-400 font-medium">Use Recipe →</span>
                </div>
             </div>
           ))}
        </div>
      )}
    </section>
  );
}