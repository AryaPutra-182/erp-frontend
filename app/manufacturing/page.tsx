import Link from 'next/link';
import { apiGet } from '../lib/api';
import { Manufacturing } from '../../types';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default async function ManufacturingPage() {
  let manufacturing: any[] = [];

  try { 
    manufacturing = await apiGet<any[]>('/manufacturing'); 
  } catch (e) { 
    manufacturing = []; 
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manufacturing Order</h1>

        <Link 
          href="/manufacturing/create"
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          + Create
        </Link>
      </div>

      {manufacturing.length === 0 ? <LoadingSkeleton /> : (
        <div className="space-y-3">
          {manufacturing.map(m => (
            <div key={m.id} className="p-4 bg-white rounded shadow flex justify-between">

              <div>
                <div className="font-semibold">{m.order_number ?? '—'}</div>
                <div className="text-sm text-gray-500">{m.product_name ?? ''}</div>
              </div>

              <div className="text-sm">{m.status ?? 'Waiting'}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
