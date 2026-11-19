import { isEmpty, type Row } from "../lib/data";

type ColumnSummaryProps = {
  columns: string[];
  rows: Row[];
};

export function ColumnSummary({ columns, rows }: ColumnSummaryProps) {
  const emptyCounts = columns.map((col) => ({
    column: col,
    empty: rows.filter((row) => isEmpty(row[col])).length,
  }));

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {emptyCounts.map(({ column, empty }) => (
        <span
          key={column}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            empty > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {column}: {empty === 0 ? "✓ complete" : `${empty} empty`}
        </span>
      ))}
    </div>
  );
}
