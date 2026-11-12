import { Panel, TableSkeleton, ErrorState, Pagination } from '../ui';
import { cn } from '../../utils/format';

/**
 * Лека таблица за админ панела.
 * columns: [{ key, header, render?(row), className? }]
 */
export const DataTable = ({
  columns,
  rows = [],
  loading,
  error,
  onRetry,
  rowKey = '_id',
  emptyText = 'Няма записи.',
  pagination,
  onPageChange,
  fetching,
}) => (
  <Panel className="grid gap-5 p-4 sm:p-6">
    {error ? (
      <ErrorState error={error} onRetry={onRetry} />
    ) : loading ? (
      <TableSkeleton />
    ) : rows.length === 0 ? (
      <p className="py-10 text-center text-slate-400">{emptyText}</p>
    ) : (
      <div className={cn('overflow-x-auto transition', fetching && 'opacity-60')}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.15em] text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-3 py-3 font-semibold', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]} className="border-b border-white/5 text-slate-200 last:border-0 hover:bg-white/[0.03]">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-3 py-3 align-middle', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {pagination && (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Общо: {pagination.total}</p>
        <Pagination page={pagination.page} pages={pagination.pages} onChange={onPageChange} disabled={fetching} />
      </div>
    )}
  </Panel>
);
