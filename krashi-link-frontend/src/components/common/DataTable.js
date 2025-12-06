import React from 'react';

const DataTable = ({ columns, rows }) => (
  <table className="table-auto w-full">
    <thead>
      <tr>{columns.map((c) => <th key={c.key}>{c.title}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((r, idx) => (
        <tr key={idx}>{columns.map((c) => <td key={c.key}>{r[c.key]}</td>)}</tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
