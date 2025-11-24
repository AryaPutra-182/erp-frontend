import Link from 'next/link'

export default function Dashboard() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Sales</h2>
          <p className="text-3xl">Rp 0</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Invoices Unpaid</h2>
          <p className="text-3xl">0</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Stock Low</h2>
          <p className="text-3xl">0</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/customers" className="px-3 py-2 bg-blue-600 text-white rounded">Manage Customers</Link>
      </div>
    </section>
  )
}
