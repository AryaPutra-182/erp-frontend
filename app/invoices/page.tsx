import { apiGet } from '../lib/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Link from 'next/link';

export default async function InvoicesPage() {
  let items = [];
  try { items = await apiGet('/invoices'); } catch (e) { items = []; }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/create" className="px-3 py-2 bg-green-600 text-white rounded">+ Create</Link>
      </div>

      {items.length === 0 ? <LoadingSkeleton /> : (
        <div className="space-y-3">
          {items.map((inv:any)=>(
            <div key={inv.id} className="p-4 bg-white rounded shadow flex justify-between">
              <div>{inv.inv_number ?? '—'}</div>
              <div>{inv.status}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
