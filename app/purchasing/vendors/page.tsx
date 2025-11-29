import Link from 'next/link';
import { apiGet } from '../../lib/api';
import { Vendor } from '../../../types';

export default async function VendorsPage() {
  let vendors: Vendor[] = [];

  try { 
    vendors = await apiGet<Vendor[]>('/vendor'); 
  } catch (e) { 
    vendors = []; 
  }

  return (
    <section>

      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-white-300">Vendors</h1>
      
        <Link
          href="/purchasing/vendors/create"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
        >
          + Create
        </Link>
      </div>

      {/* JARAK CARD DIBESARKAN */}
      <div className="flex flex-wrap gap-5">

        {vendors.map(v => (
          <div 
            key={v.id}
            className="bg-white rounded-xl shadow p-3 border hover:shadow-lg transition flex items-center gap-3 w-[260px]"
          >

            <img
              src={
                v.image
                  ? `http://localhost:5000/uploads/${v.image}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-16 h-16 object-cover rounded-lg border"
            />

            <div className="flex flex-col">
              <div className="font-semibold text-gray-900 text-sm">
                {v.vendorName}
              </div>
              <div className="text-gray-600 text-xs">
                {v.address}
              </div>
              <div className="text-gray-600 text-xs">
                {v.email}
              </div>
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}
