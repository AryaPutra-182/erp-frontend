import Link from 'next/link'
import { apiGet } from '../lib/api'
import LoadingSkeleton from '../../components/LoadingSkeleton'

interface ManufacturingRow {
  id: string;
  reference: string;
  product?: {
    id: number;
    name: string;
  }
}

export default async function ManufacturingPage() {
  
  let manufacturing: ManufacturingRow[] = []

  try {
    manufacturing = await apiGet('/manufacturing-materials')
  } catch(e) {
    manufacturing = []
  }

  const grouped = manufacturing.reduce((acc: Record<string, ManufacturingRow>, item) => {
    const key = `${item.id}-${item.product?.name}-${item.reference}`;
    if (!acc[key]) acc[key] = item;
    return acc;
  }, {});

  const uniqueRows: ManufacturingRow[] = Object.values(grouped);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-white-300">Bills Of Material</h1>
      
        <div className="flex items-center gap-2">
          <Link
            href="/manufacturing/mo-list"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Manufacturing Order
          </Link>

          <Link
            href="/manufacturing/create"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            + Create
          </Link>
        </div>
      </div>

      {uniqueRows.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="p-3 text-left font-semibold text-gray-800">
                  Product
                </th>
                <th className="p-3 text-left font-semibold text-gray-800">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueRows.map((m, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-300 hover:bg-gray-100 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 text-gray-900 font-medium">
                    <Link
                      href={`/manufacturing/manufacturing-order?ref=${m.reference}`}
                      className="block w-full"
                    >
                      {m.product?.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-800">
                    <Link
                      href={`/manufacturing/manufacturing-order?ref=${m.reference}`}
                      className="block w-full"
                    >
                      {m.reference}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
