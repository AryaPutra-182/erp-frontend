import Link from 'next/link';
import { apiGet } from '../lib/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { Customer } from '../../types';

export default async function CustomersPage({ searchParams }: { searchParams?: any }) {
  const page = Number(searchParams?.page || 1);
  const q = searchParams?.q || '';
  let customers: Customer[] = [];
  let total = 0;
  try {
    const res = await apiGet<{ rows: Customer[]; count: number }>(`/customers?page=${page}&q=${encodeURIComponent(q)}`);
    customers = res.rows || res;
    total = res.count ?? customers.length;
  } catch (e) {
    customers = [];
    total = 0;
  }

  const columns = ['Name', 'Email', 'Phone'];
  const data = customers.map(c => ({ name: c.name, email: c.email ?? '', phone: c.phone_number ?? '' }));

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Link href="/customers/create" className="px-3 py-2 bg-green-600 text-white rounded">+ Add</Link>
        </div>
      </div>

      <div className="mb-4">
        <form action="/customers" method="get" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search..." className="px-3 py-2 border rounded" />
          <button type="submit" className="px-3 py-2 bg-gray-800 text-white rounded">Search</button>
        </form>
      </div>

      {customers.length === 0 ? <LoadingSkeleton /> : <Table columns={columns} data={data} />}

      <div className="mt-4 flex justify-between items-center">
       <Pagination page={page} total={total} baseUrl="/customers" />

        <div>Total: {total}</div>
      </div>
    </section>
  )
}
