import Link from "next/link";
import { apiGet } from "../lib/api";
import DeleteEmployeeButton from "../../components/DeleteEmployeeButton"; // Pastikan path import benar

export default async function EmployeesPage() {
  // --- FETCHING DATA TETAP SAMA ---
  let employees: any[] = [];

  try {
    employees = await apiGet<any[]>("/employees");
  } catch {
    employees = [];
  }
  // --------------------------------

  return (
    <section className="min-h-screen bg-[#0D1117] text-gray-200 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Employee Directory
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/employees/create" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Add Employee
          </Link>
          <Link href="/employees/departments/create-department" className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-all">+ Dept</Link>
          <Link href="/employees/positions/create-position" className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-all">+ Position</Link>
        </div>
      </div>

      {/* EMPLOYEE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((emp, i) => {
          
          // --- LOGIC URL GAMBAR (Tetap Dipertahankan) ---
          let photoUrl = null;
          if (emp.photo) {
            let rawPath = emp.photo.trim().replace(/\\/g, "/");
            if (rawPath.startsWith("/")) rawPath = rawPath.substring(1);
            if (!rawPath.startsWith("uploads/")) rawPath = `uploads/${rawPath}`;
            photoUrl = `http://localhost:5000/${rawPath}`;
          }
          // ----------------------------------------------

          return (
            // WRAP DENGAN LINK AGAR BISA LIHAT DETAIL (/employees/[id])
            <Link 
                href={`/employees/${emp.id}`} 
                key={i}
                className="group relative bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 block"
            >
              
              {/* === TOMBOL DELETE (Client Component) === */}
              <DeleteEmployeeButton id={emp.id} />

              {/* HEADER GAMBAR / AVATAR */}
              <div className="h-48 overflow-hidden relative bg-gray-800">
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt={emp.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-500 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-60"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-600 group-hover:bg-gray-700 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
              </div>

              {/* INFO BODY */}
              <div className="p-5 relative">
                <div className="mb-1">
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={emp.name}>
                        {emp.name}
                    </h2>
                    <p className="text-sm font-medium text-emerald-400 truncate">
                        {emp.Position?.name || "No Position"}
                    </p>
                </div>

                <div className="my-4 border-t border-gray-800"></div>

                <div className="space-y-2.5">
                    {/* Department */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        <span className="truncate">{emp.Department?.name || "Unassigned Dept"}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 group/email cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span className="truncate font-mono text-xs bg-gray-800/50 px-2 py-1 rounded text-cyan-500/80 group-hover/email:text-cyan-400 transition">
                            {emp.email}
                        </span>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>

            </Link>
          );
        })}
      </div>

      {employees.length === 0 && (
          <div className="text-center py-20 bg-[#161b22] border border-gray-800 border-dashed rounded-xl mt-6">
              <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-gray-400 text-lg">No employees found.</p>
              <p className="text-gray-600 text-sm">Get started by adding a new employee.</p>
          </div>
      )}

    </section>
  );
}