import Link from "next/link";
import { apiGet } from "../../lib/api"; 
import DeletePositionButton from "../../../components/DeletePositionButton"; // Import komponen baru

export default async function PositionsPage() {

  let positions: any[] = [];

  try {
    // --- FETCHING TIDAK DIUBAH (Sesuai Permintaan) ---
    positions = await apiGet("/positions");
  } catch {
    positions = [];
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Job Positions
        </h1>

        <Link
          href="/employees/positions/create-position"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white transition font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Position
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
        <table className="w-full bg-[#161b22] text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
            <tr>
              <th className="py-3 px-6 border-b border-gray-700">Position Name</th>
              <th className="py-3 px-6 text-center border-b border-gray-700 w-32">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {positions.length > 0 ? (
              positions.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition">
                  
                  {/* Position Name */}
                  <td className="py-4 px-6 text-white font-medium">
                    {p.name}
                  </td>

                  {/* Actions (HANYA DELETE) */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <DeletePositionButton id={p.id} />
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-8 px-6 text-center text-gray-500">
                  No positions found. Create one to continue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}