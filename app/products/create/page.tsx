'use client';
import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import { useRouter } from 'next/navigation';
import { Product } from '../../../types';

export default function CreateProduct() {
  const [form, setForm] = useState<Partial<Product>>({ name: '', type: 'Storable', stock: 0, sale_price: 0 });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return push('Product name required', 'error');
    try {
      setLoading(true);
      await apiPost('/inventory', form);
      push('Product created', 'success');
      router.push('/products');
    } catch (err: any) {
      push('Failed to create product: ' + (err?.message ?? String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={form.name ?? ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" className="w-full px-3 py-2 border rounded" />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded">
          <option>Storable</option>
          <option>Service</option>
          <option>Consumable</option>
        </select>
        <input type="number" value={form.stock ?? 0} onChange={e => setForm({...form, stock: Number(e.target.value)})} placeholder="Stock" className="w-full px-3 py-2 border rounded" />
        <input type="number" value={form.sale_price ?? 0} onChange={e => setForm({...form, sale_price: Number(e.target.value)})} placeholder="Sale Price" className="w-full px-3 py-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  )
}
