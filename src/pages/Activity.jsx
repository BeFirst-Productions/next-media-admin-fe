import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Info, User, FileText, Lock, Shield, Activity as ActivityIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { activityApi } from '@/api/activity.api'
import { Pagination } from '@/components/ui/Pagination'
import { formatDate, timeAgo, formatTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const getActivityConfig = (type) => {
  switch (type) {
    case 'admin': return { bg: 'bg-brand-500', icon: User, color: 'text-white' }
    case 'content': return { bg: 'bg-green-500', icon: FileText, color: 'text-white' }
    case 'user': return { bg: 'bg-red-400', icon: Shield, color: 'text-white' }
    case 'security': return { bg: 'bg-amber-500', icon: Lock, color: 'text-white' }
    case 'auth': return { bg: 'bg-teal-500', icon: User, color: 'text-white' }
    default: return { bg: 'bg-gray-500', icon: Info, color: 'text-white' }
  }
}

export default function Activity() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page, search],
    queryFn:  () => activityApi.list({ page, limit: 15, search }).then((r) => r.data),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Activity Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive timeline of system events · {data?.meta?.total ?? 0} total</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search activities by action or actor…" className="input-base pl-10 w-full" />
        </div>

        <div className="relative pl-6 sm:pl-10 pb-4 border-l-2 border-gray-100 dark:border-gray-800 ml-4 sm:ml-6 mt-4">
          {isLoading ? (
            Array.from({length: 6}).map((_, i) => (
              <div key={i} className="mb-8 relative">
                <div className="absolute -left-8 sm:-left-12 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900" />
                <div className="skeleton h-5 w-48 mb-2" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))
          ) : data?.data?.length > 0 ? (
            data.data.map((activity, i) => {
              const conf = getActivityConfig(activity.type)
              const Icon = conf.icon
              return (
                <motion.div 
                  key={activity._id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="mb-8 relative group"
                >
                  <div className={cn(
                    "absolute -left-[30px] sm:-left-[43px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-sm",
                    conf.bg
                  )}>
                    <Icon size={12} className={conf.color} />
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{activity.action}</p>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md shrink-0 self-start">
                        {formatTime(new Date(activity.createdAt))} ({timeAgo(new Date(activity.createdAt))})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-brand-600 dark:text-brand-400">{activity.actor}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>{formatDate(new Date(activity.createdAt))} • {formatTime(new Date(activity.createdAt))}</span>
                    </div>
                    {activity.details && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{activity.details}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="py-12 text-center">
              <ActivityIcon size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No activity recorded here yet</h3>
              <p className="text-gray-500 mt-1">Actions performed by users and admins will appear here.</p>
            </div>
          )}
        </div>
        
        {data?.meta?.totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
