import { isEmpty, type Row } from "../lib/data";
import type { Failure } from "../lib/rules";

type DataTableProps = {
  columns: string[];
  rows: Row[];
  failures: Failure[];
};

const MAX_ROWS = 50;

export function DataTable({ columns, rows, failures }: DataTableProps) {
  // "rowIndex:column" -> why that cell failed
  const failureMap = new Map<string, string[]>();
  for (const f of failures) {
    const key = `${f.rowIndex}:${f.column}`;
    failureMap.set(key, [...(failureMap.get(key) ?? []), f.message]);
  }

  const emptyCounts = Object.fromEntries(
    columns.map((col) => [col, rows.filter((row) => isEmpty(row[col])).length]),
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-paper/60 text-left">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 align-top text-xs font-medium text-muted">
                #
              </th>
              {columns.map((col) => (
                <th key={col} scope="col" className="px-4 py-3 align-top">
                  <span className="block font-medium">{col}</span>
                  <span className="block text-xs font-normal text-muted">
                    {emptyCounts[col] === 0 ? "No empty cells" : `${emptyCounts[col]} empty`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[13px]">
            {rows.slice(0, MAX_ROWS).map((row, i) => (
              <tr key={i} className="border-t first:border-t-0 hover:bg-paper/50">
                <td className="px-4 py-2.5 text-muted tabular-nums">{i + 1}</td>
                {columns.map((col) => {
                  const messages = failureMap.get(`${i}:${col}`);
                  const content = isEmpty(row[col]) ? (
                    <span className={`font-sans italic ${messages ? "" : "text-muted"}`}>empty</span>
                  ) : (
                    row[col]
                  );
                  return (
                    <td
                      key={col}
                      title={messages?.join(", ")}
                      className="whitespace-nowrap px-4 py-2.5"
                    >
                      {messages ? <span className="marker">{content}</span> : content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_ROWS && (
        <p className="border-t px-4 py-2.5 text-xs text-muted">
          Showing the first {MAX_ROWS} of {rows.length} rows.
        </p>
      )}
    </div>
  );
}
