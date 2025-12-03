import Link from "next/link";
import { apiGet } from "../../lib/api";

export default async function PositionsPage() {

  let positions: any[] = [];

  try {
    positions = await apiGet("/positions");
  } catch {
    positions = [];
  }

  return (
    <section className="text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Positions</h1>

        <Link
          href="/employees/positions/create-position"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          + Add Position
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-900 border border-gray-700 rounded-lg">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left border-b border-gray-700">Position Name</th>
              <th className="py-3 px-4 text-center border-b border-gray-700 w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {positions.length > 0 ? (
              positions.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-800 transition">
                  <td className="py-3 px-4">{p.name}</td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/employees/positions/${p.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <button className="text-red-400 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-4 px-4 text-center text-gray-400">
                  No positions found — create one to continue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
