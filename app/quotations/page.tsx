import Link from 'next/link';
import { apiGet } from '../lib/api';
import { Quotation } from '../../types';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default async function QuotationsPage() {
  let quotations: Quotation[] = [];
  try { quotations = await apiGet<Quotation[]>('/quotations'); } catch (e) { quotations = []; }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <Link href="/quotations/create" className="px-3 py-2 bg-green-600 text-white rounded">+ Create</Link>
      </div>

      {quotations.length === 0 ? <LoadingSkeleton /> : (
        <div className="space-y-3">
          {quotations.map(q => (
            <div key={q.id} className="p-4 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{q.quotation_number ?? '—'}</div>
                <div className="text-sm text-gray-500">{q.customer_name ?? ''}</div>
              </div>
              <div className="text-sm">{q.status}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
