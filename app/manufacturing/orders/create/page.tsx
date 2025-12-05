import Link from 'next/link'
import { apiGet } from '../../../lib/api'

export default async function CreateSelector() {
  let boms: any[] = []
  try {
    const response = await apiGet<any>('/manufacturing-materials'); 
    const grouped = (response.rows || response || []).reduce((acc: any, item: any) => {
        if (!acc[item.reference]) acc[item.reference] = item;
        return acc;
    }, {});
    boms = Object.values(grouped);
  } catch(e) { boms = [] }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      <div className="max-w-5xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Start New Order</h1>
          <p className="text-gray-400">Select a recipe or create manually.</p>
      </div>

      <div className="max-w-5xl mx-auto mb-6 flex justify-between">
         <Link href="/manufacturing/orders/list" className="text-gray-400">← Back</Link>
         <Link href="/manufacturing/orders/new" className="px-4 py-2 bg-gray-700 text-white rounded">Manual Input</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
           {boms.map((m: any, idx: number) => (
             <div key={idx} className="relative bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition">
                {/* LINK KE FILE [id] DENGAN ID='new' */}
                <Link href={`/manufacturing/orders/new?ref=${m.reference}`} className="absolute inset-0 z-10"></Link>
                <h3 className="font-bold text-white">{m.product?.name}</h3>
                <p className="text-xs text-gray-500">{m.reference}</p>
                <span className="text-blue-400 text-sm mt-4 block">Start Production →</span>
             </div>
           ))}
      </div>
    </section>
  );
}