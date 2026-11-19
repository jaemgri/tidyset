import { isEmpty, type Row } from "../lib/data";
import type { Failure } from "../lib/rules";

type DataTableProps = {
  columns: string[];
  rows: Row[];
  failures: Failure[];
};

export function DataTable({ columns, rows, failures }: DataTableProps) {
  // "rowIndex:column" -> list of failure messages for that cell
  const failureMap = new Map<string, string[]>();
  for (const f of failures) {
    const key = `${f.rowIndex}:${f.column}`;
    failureMap.set(key, [...(failureMap.get(key) ?? []), f.message]);
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-400">#</th>
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
              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
              {columns.map((col) => {
                const messages = failureMap.get(`${i}:${col}`);
                return (
                  <td
                    key={col}
                    title={messages?.join(", ")}
                    className={`px-3 py-2 ${messages ? "bg-red-50 text-red-600" : ""}`}
                  >
                    {isEmpty(row[col]) ? (
                      <span className="italic text-gray-400">empty</span>
                    ) : (
                      row[col]
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
