import Link from 'next/link'
import { apiGet } from '../../lib/api'
import LoadingSkeleton from '../../../components/LoadingSkeleton'

interface ManufacturingRow {
  id: number
  moNumber?: string
  quantityToProduce?: number
  product?: {
    id: number
    name: string
  }
}

export default async function ManufacturingList() {

  let manufacturing: ManufacturingRow[] = []

  try {
    manufacturing = await apiGet('/manufacturing/mo')
  } catch(e) {
    manufacturing = []
  }

  return (
    <section className="p-4 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-cyan-300">
          Manufacturing Orders
        </h1>
      </div>

      {manufacturing.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="p-3 text-left font-semibold text-gray-800">
                  MO Number
                </th>
                <th className="p-3 text-left font-semibold text-gray-800">
                  Product
                </th>
                <th className="p-3 text-left font-semibold text-gray-800">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {manufacturing.map((m, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-300 hover:bg-gray-100 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 text-gray-900 font-medium">
                    <Link href={`/manufacturing/manufacturing-order?id=${m.id}`} className="block w-full">
                      {m.moNumber}
                    </Link>
                  </td>

                  <td className="p-3 text-gray-900">
                    {m.product?.name}
                  </td>

                  <td className="p-3 text-gray-900">
                    {m.quantityToProduce?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
