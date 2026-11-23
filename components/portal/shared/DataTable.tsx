import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  renderMobileCard?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyState,
  renderMobileCard,
  className = "",
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-rule/80 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#F8FAF9] border-b border-rule/80 text-muted uppercase tracking-wider text-[11px] font-bold">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-5 py-3.5 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60 text-ink">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? "hover:bg-surface cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-4 ${col.className || ""}`}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Collapsed View */}
      <div className="md:hidden space-y-3">
        {data.map((row) => {
          if (renderMobileCard) {
            return (
              <div
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {renderMobileCard(row)}
              </div>
            );
          }

          return (
            <div
              key={keyExtractor(row)}
              onClick={() => onRowClick && onRowClick(row)}
              className="p-4 rounded-2xl bg-white border border-rule/80 shadow-xs space-y-2.5 text-xs"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted text-[11px] uppercase">
                    {col.header}
                  </span>
                  <div className="text-right font-medium text-ink">
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
