import React from "react";

interface Props {
  columns: string[];
  data: Record<string, any>[];
}

export default function Table({ columns, data }: { columns: string[]; data: Record<string, any>[] }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
      <table className="min-w-full">
        {/* HEADER */}
        <thead className="bg-slate-800 border-b border-slate-700">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-cyan-300 uppercase tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-slate-500"
              >
                No data found
              </td>
            </tr>
          )}

          {data.map((row, rIndex) => (
            <tr
              key={rIndex}
              className="border-b border-slate-800 hover:bg-slate-800/60 transition"
            >
              {columns.map((col, cIndex) => (
                <td key={cIndex} className="px-4 py-3 text-sm text-slate-200">
                  {row[col.toLowerCase()] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
