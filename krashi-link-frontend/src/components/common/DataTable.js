import React from 'react';

const DataTable = ({ columns, rows }) => (
  // CHANGE 1: 'overflow-x-auto' is crucial. It adds a scrollbar ONLY to the table on mobile.
  // 'shadow-md' & 'rounded-lg' gives it a premium card look.
  <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
    <table className="w-full text-sm text-left text-gray-600">
      
      {/* CHANGE 2: Distinct Header Styling */}
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="px-6 py-3 font-semibold whitespace-nowrap">
              {c.title}
            </th>
          ))}
        </tr>
      </thead>

      {/* CHANGE 3: Spaced out rows with Hover effect */}
      <tbody>
        {rows.length > 0 ? (
          rows.map((r, idx) => (
            <tr 
              key={idx} 
              className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((c) => (
                // 'whitespace-nowrap' prevents text from breaking into ugly multiple lines
                <td key={c.key} className="px-6 py-4 whitespace-nowrap">
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          // BONUS: Handling empty state cleanly
          <tr>
            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;