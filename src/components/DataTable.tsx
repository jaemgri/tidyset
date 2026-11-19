import { isEmpty, type Row } from "../lib/data";

type DataTableProps = {
  columns: string[];
  rows: Row[];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => {
                const empty = isEmpty(row[col]);
                return (
                  <td
                    key={col}
                    className={'px-3 py-2 ${empty ? "bg-red-50 text-red-500" : ""}'}
                  >
                    {empty ? "empty" : row[col]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
