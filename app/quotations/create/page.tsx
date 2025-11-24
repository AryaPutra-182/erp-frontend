'use client';
import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import { useRouter } from 'next/navigation';
import { Quotation, QuotationItem } from '../../../types';

export default function CreateQuotation() {
  const [form, setForm] = useState<Partial<Quotation>>({ customer_id: undefined, quotation_date: '', items: [] });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...(prev.items||[]), { product_id: 0, quantity: 1, unit_price: 0 }] }));
  };

  const updateItem = (idx: number, patch: Partial<QuotationItem>) => {
    const items = [...(form.items||[])];
    items[idx] = { ...items[idx], ...patch };
    setForm(prev => ({ ...prev, items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id) return push('Customer ID required', 'error');
    try {
      setLoading(true);
      await apiPost('/quotations', form);
      push('Quotation created', 'success');
      router.push('/quotations');
    } catch (err: any) {
      push('Failed to create quotation: ' + (err?.message ?? String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Quotation</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={form.customer_id ?? ''} onChange={e => setForm({...form, customer_id: Number(e.target.value)})} placeholder="Customer ID" className="w-full px-3 py-2 border rounded" />
        <input value={form.quotation_date ?? ''} onChange={e => setForm({...form, quotation_date: e.target.value})} placeholder="Quotation Date" type="date" className="w-full px-3 py-2 border rounded" />

        <div>
          <h3 className="font-semibold">Items</h3>
          {(form.items || []).map((it, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-center">
              <input value={it.product_id} onChange={e => updateItem(idx, { product_id: Number(e.target.value) })} className="px-2 py-1 border rounded" placeholder="Product ID" />
              <input value={it.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="px-2 py-1 border rounded" placeholder="Qty" type="number" />
              <input value={it.unit_price} onChange={e => updateItem(idx, { unit_price: Number(e.target.value) })} className="px-2 py-1 border rounded" placeholder="Unit Price" type="number" />
              <div className="text-right">{(it.quantity * it.unit_price).toFixed(2)}</div>
            </div>
          ))}

          <div className="mt-2">
            <button type="button" onClick={addItem} className="px-3 py-1 bg-gray-800 text-white rounded">Add Item</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
