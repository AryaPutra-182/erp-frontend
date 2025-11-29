import Link from 'next/link'
import { apiGet } from '../lib/api'
import { RFQ } from '../../types'
import LoadingSkeleton from '../../components/LoadingSkeleton'

export default async function PurchasingPage() {

  let rfqs: RFQ[] = []

  try { 
    rfqs = await apiGet('/purchase/rfq-list') 
  } catch(e) { 
    rfqs = [] 
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white-300">Request Of Quotation</h1>

        <div className="flex items-center gap-2">
          <Link href="/purchasing/vendors" className="px-4 py-2 bg-green-600 text-white rounded">Vendors</Link>
          <Link href="/purchasing/create-rfq" className="px-4 py-2 bg-green-600 text-white rounded">+ Create</Link>
        </div>
      </div>

      {rfqs.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="p-3 text-left font-semibold text-gray-800">Referece</th>
                <th className="p-3 text-left font-semibold text-gray-800">Vendor</th>
                <th className="p-3 text-left font-semibold text-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-300 hover:bg-gray-100 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-semibold text-black">
                    <Link href={`/purchasing/create-rfq?ref=${r.rfqNumber}`} className="block w-full">
                      {r.rfqNumber}
                    </Link>
                  </td>

                  <td className="p-3 text-black">
                    {r.vendorName}
                  </td>

                  <td className="p-3 text-green-700 font-medium">
                    {Number(r.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
