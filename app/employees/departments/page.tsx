import Link from "next/link";
import { apiGet } from "../../lib/api"; // Sesuaikan path import lib/api Anda
import DeleteDepartmentButton from "../../../components/DeleteDepartmentButton"; // Sesuaikan path import

export default async function DepartmentsPage() {

  let departments: any[] = [];

  try {
    // --- FETCHING ASLI ANDA (TIDAK SAYA UBAH) ---
    departments = await apiGet("/departments"); 
  } catch (e) {
    departments = [];
  }

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Departments</h1>

        <Link
          href="/employees/departments/create-department"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white transition font-medium flex items-center gap-2"
        >
          <span>+</span> Add Department
        </Link>
      </div>

      {/* TABLE LIST */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
        <table className="w-full bg-[#161b22] text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
            <tr>
              <th className="py-3 px-6 border-b border-gray-700">Name</th>
              <th className="py-3 px-6 border-b border-gray-700">Manager</th>
              <th className="py-3 px-6 border-b border-gray-700">Parent Dept</th>
              <th className="py-3 px-6 text-center border-b border-gray-700 w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {departments.length > 0 ? (
              departments.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-800/50 transition duration-150">
                  
                  {/* Name */}
                  <td className="py-4 px-6 font-medium text-white">
                    {d.name}
                  </td>

                  {/* Manager */}
                  <td className="py-4 px-6 text-gray-300">
                    {d.manager ? (
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-xs text-blue-200 border border-blue-800">
                                {d.manager.name.charAt(0)}
                            </span>
                            {d.manager.name}
                        </div>
                    ) : <span className="text-gray-500 italic">-</span>}
                  </td>

                  {/* Parent Dept */}
                  <td className="py-4 px-6 text-gray-300">
                    {d.parent ? (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">
                            {d.parent.name}
                        </span>
                    ) : <span className="text-gray-500 italic">Root Level</span>}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-4 items-center">
                      {/* Link Edit */}
                      <Link
                        href={`/employees/departments/edit/${d.id}`}
                        className="text-blue-400 hover:text-blue-300 hover:underline transition font-medium"
                      >
                        Edit
                      </Link>

                      {/* Tombol Delete (Client Component) */}
                      <DeleteDepartmentButton id={d.id} />
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td className="py-12 px-6 text-gray-500 text-center" colSpan={4}>
                  <p className="text-lg mb-2">No departments found.</p>
                  <p className="text-sm">Create a new department to organize your employees.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}