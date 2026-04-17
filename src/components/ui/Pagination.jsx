import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
      <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
          <ChevronLeft size={15} className="text-gray-600 dark:text-gray-400" />
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400')}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
          <ChevronRight size={15} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}