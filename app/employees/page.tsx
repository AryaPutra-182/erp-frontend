import Link from "next/link";
import { apiGet } from "../lib/api";

export default async function EmployeesPage() {
  let employees: any[] = [];
  let departments: any[] = [];

  try {
    employees = await apiGet<any[]>("/employees");
  } catch {
    employees = [];
  }

  try {
    departments = await apiGet<any[]>("/departments");
  } catch {
    departments = [];
  }

  return (
    <section>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Employees</h1>

        <div className="flex gap-2">
          <Link
            href="/employees/create"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Employee
          </Link>

          <Link
            href="/employees/departments/create-department"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            + Add Department
          </Link>

           <Link
            href="/employees/positions/create-position"
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            + Add Position
          </Link>
        </div>
      </div>

      {/* EMPLOYEE LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {employees.map((emp, i) => (
          <div 
            key={i} 
            className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-gray-500 duration-150"
          >
            {/* PHOTO */}
            <div className="w-full h-40 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
              {emp.photo ? (
                <img
                  src={`http://localhost:5000/${emp.photo}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">No Photo</span>
              )}
            </div>

            {/* EMPLOYEE INFO */}
            <div className="mt-3 text-white">
              <div className="font-bold">{emp.name}</div>
              <div className="text-sm text-gray-400">
                {emp.Position?.name ? emp.Position.name : "No Position"}
              </div>
              <div className="text-sm text-gray-300">
                {emp.Department?.name ? emp.Department.name : "No Department"}
              </div>
              <div className="text-sm text-cyan-300 font-semibold">{emp.email}</div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
