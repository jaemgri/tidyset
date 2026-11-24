import type { DatasetSummary } from "../lib/db";

type DatasetListProps = {
  datasets: DatasetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
};

export function DatasetList({ datasets, selectedId, onSelect, onDelete, onNew }: DatasetListProps) {
  return (
    <nav aria-label="Your datasets">
      <button
        onClick={onNew}
        className="mb-5 flex h-9 w-full items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-ink-soft"
      >
        <span aria-hidden="true" className="text-base leading-none">
          +
        </span>
        New dataset
      </button>

      <p className="px-2 pb-1.5 text-xs font-medium text-muted">Your datasets</p>

      {datasets.length === 0 ? (
        <p className="px-2 text-sm text-muted">Datasets you upload appear here.</p>
      ) : (
        <ul className="space-y-0.5">
          {datasets.map((d) => {
            const selected = d.id === selectedId;
            return (
              <li
                key={d.id}
                className={`group flex items-center rounded-md text-sm ${
                  selected ? "bg-paper font-medium" : "hover:bg-paper/60"
                }`}
              >
                <button
                  onClick={() => onSelect(d.id)}
                  aria-current={selected ? "true" : undefined}
                  className="flex min-w-0 flex-1 items-baseline justify-between gap-2 px-2 py-2 text-left"
                >
                  <span className="truncate">{d.name}</span>
                  <span className="shrink-0 text-xs font-normal text-muted tabular-nums group-hover:hidden">
                    {d.rowCount} rows
                  </span>
                </button>
                <button
                  onClick={() => onDelete(d.id)}
                  className="mr-1 hidden rounded px-1.5 py-0.5 text-xs text-muted hover:bg-white hover:text-red-700 group-hover:block"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
