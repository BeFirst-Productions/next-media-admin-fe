import { cn } from '@/utils/cn';

export function Table({ columns, data, loading, emptyText = 'No data found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {columns.map((col) => (
              <th key={col.key} className={cn('py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 px-4">
                    <div className="skeleton h-4 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-gray-400 dark:text-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data?.map((row, i) => (
              <tr key={row._id || i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={cn('py-3.5 px-4 text-gray-700 dark:text-gray-300', col.cellClassName)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}