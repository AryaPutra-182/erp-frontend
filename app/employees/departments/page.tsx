import Link from "next/link";
import { apiGet } from "../../lib/api";

export default async function DepartmentsPage() {

  let departments: any[] = [];

  try {
    departments = await apiGet("/departments");
  } catch (e) {
    departments = [];
  }

  return (
    <section className="text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>

        <Link
          href="/employees/departments/create"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          + Add Department
        </Link>
      </div>

      {/* TABLE LIST */}
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-900 border border-gray-700 rounded-lg">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left border-b border-gray-700">Name</th>
              <th className="py-3 px-4 text-left border-b border-gray-700">Manager</th>
              <th className="py-3 px-4 text-left border-b border-gray-700">Parent Department</th>
              <th className="py-3 px-4 text-center border-b border-gray-700 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length > 0 ? (
              departments.map((d) => (
                <tr key={d.id} className="hover:bg-gray-800 transition">
                  
                  <td className="py-3 px-4">{d.name}</td>

                  <td className="py-3 px-4 text-gray-300">
                    {d.manager ? d.manager.name : <span className="text-gray-500 italic">None</span>}
                  </td>

                  <td className="py-3 px-4 text-gray-300">
                    {d.parent ? d.parent.name : <span className="text-gray-500 italic">Root</span>}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/employees/departments/${d.id}`}
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
                <td className="py-4 px-4 text-gray-400 text-center" colSpan={4}>
                  No departments found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
