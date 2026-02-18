"use client";

import { ReactNode, useState } from "react";
import clsx from "clsx";

/* ───────── Types ───────── */

export interface AdminColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  /** Optional slot for a row-actions column */
  renderActions?: (row: T) => ReactNode;
  /** Selection support */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
}

/* ───────── Component ───────── */

export function AdminTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  emptyMessage = "Nothing here yet",
  renderActions,
  selectable,
  selectedKeys,
  onSelectionChange,
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const allKeys = new Set(data.map(getRowKey));
  const allSelected =
    selectable && selectedKeys && data.length > 0 && data.every((r) => selectedKeys.has(getRowKey(r)));

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(allKeys);
    }
  }

  function toggleRow(key: string) {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-admin-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-panel">
            {selectable ? (
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!allSelected}
                  onChange={toggleAll}
                  className="rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40 h-3.5 w-3.5"
                />
              </th>
            ) : null}
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted",
                  col.sortable && "cursor-pointer select-none hover:text-admin-text-secondary",
                  col.className
                )}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key ? (
                    <span className="text-admin-accent">{sortAsc ? "↑" : "↓"}</span>
                  ) : null}
                </span>
              </th>
            ))}
            {renderActions ? (
              <th className="w-16 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-admin-text-muted">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0) + (selectable ? 1 : 0)}
                className="px-3 py-12 text-center text-sm text-admin-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const key = getRowKey(row);
              return (
                <tr
                  key={key}
                  className={clsx(
                    "transition-colors duration-100",
                    onRowClick
                      ? "cursor-pointer hover:bg-white/[0.03]"
                      : "hover:bg-white/[0.02]",
                    selectable && selectedKeys?.has(key) && "bg-admin-accent/5"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable ? (
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedKeys?.has(key) ?? false}
                        onChange={() => toggleRow(key)}
                        className="rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40 h-3.5 w-3.5"
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key} className={clsx("px-3 py-2.5 text-admin-text", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                  {renderActions ? (
                    <td
                      className="px-3 py-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(row)}
                    </td>
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
