'use client';
import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function CreateDelivery() {
  const [form, setForm] = useState<any>({ sales_order_id: undefined, scheduled_date: '' });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sales_order_id) return push('Sales order ID required', 'error');
    try {
      setLoading(true);
      await apiPost('/delivery', form);
      push('Delivery order created', 'success');
      router.push('/delivery-orders');
    } catch (err:any) {
      push('Failed to create delivery order: ' + (err?.message ?? String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Delivery Order</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={form.sales_order_id ?? ''} onChange={e => setForm({...form, sales_order_id: Number(e.target.value)})} placeholder="Sales Order ID" className="w-full px-3 py-2 border rounded" />
        <input value={form.scheduled_date ?? ''} onChange={e => setForm({...form, scheduled_date: e.target.value})} placeholder="Scheduled Date" type="date" className="w-full px-3 py-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
