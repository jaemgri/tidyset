import type { DatasetSummary } from "../lib/db";

type DatasetListProps = {
  datasets: DatasetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function DatasetList({ datasets, selectedId, onSelect, onDelete }: DatasetListProps) {
  return (
    <aside>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Your datasets
      </h2>

      {datasets.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing saved yet.</p>
      ) : (
        <ul className="space-y-1">
          {datasets.map((d) => (
            <li
              key={d.id}
              className={`group flex items-center justify-between rounded px-2 py-1.5 text-sm ${
                d.id === selectedId ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              <button onClick={() => onSelect(d.id)} className="flex-1 truncate text-left">
                {d.name}
                <span className="ml-1 opacity-60">· {d.rowCount} rows</span>
              </button>
              <button
                onClick={() => onDelete(d.id)}
                className="ml-2 hidden text-xs opacity-60 hover:opacity-100 group-hover:block"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
