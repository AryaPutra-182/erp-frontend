import { apiGet } from '../lib/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Link from 'next/link';

export default async function QuotationPage() {
  let items = [];
  try { items = await apiGet('/quotation'); } catch (e) { items = []; }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quotation</h1>
        <Link href="/sales-orders/create" className="px-3 py-2 bg-green-600 text-white rounded">+ Create</Link>
      </div>

      {items.length === 0 ? <LoadingSkeleton /> : (
        <div className="space-y-3">
          {items.map((s:any)=>(
            <div key={s.id} className="p-4 bg-white rounded shadow flex justify-between">
              <div>{s.so_number ?? '—'}</div>
              <div>{s.status}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
