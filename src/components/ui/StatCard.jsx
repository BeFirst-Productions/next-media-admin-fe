import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/formatters'

const COLORS = {
  blue:   { wrap: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-100 dark:ring-blue-800/40' },
  green:  { wrap: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400', ring: 'ring-green-100 dark:ring-green-800/40' },
  purple: { wrap: 'bg-purple-50 dark:bg-purple-900/20',icon:'text-purple-600 dark:text-purple-400',ring:'ring-purple-100 dark:ring-purple-800/40' },
  amber:  { wrap: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800/40' },
  red:    { wrap: 'bg-red-50 dark:bg-red-900/20',     icon: 'text-red-600 dark:text-red-400',     ring: 'ring-red-100 dark:ring-red-800/40' },
  teal:   { wrap: 'bg-teal-50 dark:bg-teal-900/20',   icon: 'text-teal-600 dark:text-teal-400',   ring: 'ring-teal-100 dark:ring-teal-800/40' },
}

export function StatCard({ title, value, change, icon: Icon, color = 'blue', prefix = '', suffix = '', loading }) {
  const c = COLORS[color] || COLORS.blue
  if (loading) return (
    <div className="card p-6 space-y-3">
      <div className="skeleton h-4 w-24 rounded" /><div className="skeleton h-9 w-32 rounded" /><div className="skeleton h-3 w-40 rounded" />
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card card-hover p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {prefix}{typeof value === 'number' ? formatNumber(value) : (value ?? '—')}{suffix}
          </p>
        </div>
        <div className={cn('p-3 rounded-2xl ring-1 flex-shrink-0', c.wrap, c.ring)}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
      {change != null && (
        <div className="mt-4 flex items-center gap-1.5">
          {change >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={cn('text-sm font-medium', change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-400">vs last period</span>
        </div>
      )}
    </motion.div>
  )
}