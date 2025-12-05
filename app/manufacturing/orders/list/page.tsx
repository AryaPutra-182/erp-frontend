import Link from 'next/link'
import { apiGet } from '../../../lib/api'

export default async function ManufacturingListPage() {
  let manufacturing = []
  try {
    const response = await apiGet<any>('/manufacturing/mo');
    manufacturing = response.rows || response.data || response || [];
  } catch(e) { manufacturing = [] }
  
  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Manufacturing Orders</h1>
        <Link href="/manufacturing/orders/create" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500">+ New MO</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {manufacturing.map((m: any, idx: number) => (
             <Link href={`/manufacturing/orders/${m.id}`} key={idx} className="block bg-[#161b22] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition">
                <div className="flex justify-between mb-4">
                   <span className="font-bold text-white font-mono">{m.moNumber}</span>
                   <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded">{m.status}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{m.product?.name}</p>
                <p className="text-xl font-bold text-emerald-400">{Number(m.quantityToProduce).toFixed(0)} Units</p>
             </Link>
           ))}
      </div>
    </section>
  );
}