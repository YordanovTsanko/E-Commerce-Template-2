import { Panel, TableSkeleton, ErrorState, Pagination } from '../ui';
import { cn } from '../../utils/format';

/**
 * Лека таблица за админ панела.
 * columns: [{ key, header, render?(row), className? }]
 *
 * Десктоп (md+): класическа таблица.
 * Телефон: всеки ред е карта – първата колона е заглавие, останалите са „етикет: стойност“,
 * а колоната с действия (без header) е най-долу.
 */
const cellValue = (col, row) => (col.render ? col.render(row) : row[col.key]);

const MobileCards = ({ columns, rows, rowKey }) => {
  const [first, ...rest] = columns;
  const fields = rest.filter((col) => col.header);
  const actions = rest.filter((col) => !col.header);

  return (
    <ul className="grid min-w-0 gap-3 md:hidden">
      {rows.map((row) => (
        <li key={row[rowKey]} className="grid min-w-0 gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
          {first && <div className="min-w-0 break-words">{cellValue(first, row)}</div>}

          {fields.length > 0 && (
            <dl className="grid min-w-0 gap-2 border-t border-white/5 pt-3">
              {fields.map((col) => (
                <div key={col.key} className="flex min-w-0 items-center justify-between gap-3">
                  <dt className="shrink-0 text-xs uppercase tracking-[0.15em] text-slate-500">{col.header}</dt>
                  <dd className="flex min-w-0 justify-end break-words text-right">{cellValue(col, row)}</dd>
                </div>
              ))}
            </dl>
          )}

          {actions.map((col) => (
            <div key={col.key} className="flex justify-end border-t border-white/5 pt-3">
              {cellValue(col, row)}
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
};

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
  <Panel className="grid min-w-0 gap-5 p-3 sm:p-6">
    {error ? (
      <ErrorState error={error} onRetry={onRetry} />
    ) : loading ? (
      <TableSkeleton />
    ) : rows.length === 0 ? (
      <p className="py-10 text-center text-slate-400">{emptyText}</p>
    ) : (
      <div className={cn('min-w-0 transition', fetching && 'opacity-60')}>
        <MobileCards columns={columns} rows={rows} rowKey={rowKey} />

        <div className="hidden overflow-x-auto md:block">
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
                      {cellValue(col, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
