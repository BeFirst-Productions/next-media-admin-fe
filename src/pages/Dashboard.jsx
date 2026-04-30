import { useState } from 'react'
import { Users, FileText, TrendingUp, Activity, Globe, Cpu, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { StatCard } from '@/components/ui/StatCard'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { useWebsiteAnalytics } from '@/hooks/useAnalytics'
import { formatCurrency, formatPercent, formatNumber, timeAgo, formatDateTime, formatTime } from '@/utils/formatters'
import { MiniSparkline } from '@/components/charts/MiniSparkline'
import { userApi } from '@/api/user.api'
import { blogsApi } from '@/api/blogs.api'
import { activityApi } from '@/api/activity.api'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const getActivityDotColor = (type) => {
  switch (type) {
    case 'admin': return 'bg-brand-500'
    case 'content': return 'bg-green-500'
    case 'user': return 'bg-red-400'
    case 'security': return 'bg-amber-500'
    case 'auth': return 'bg-teal-500'
    default: return 'bg-gray-500'
  }
}

export default function Dashboard() {
  const { isSuperAdmin } = useAuth()
  const [activitySearch, setActivitySearch] = useState('')


  const { data: usersData } = useQuery({
    queryKey: ['admins-count'],
    queryFn:  () => userApi.list({ limit: 1 }).then((r) => r.data),
    enabled:  isSuperAdmin,
  })
  const { data: websiteData } = useWebsiteAnalytics()
  const { data: blogsData } = useQuery({
    queryKey: ['blogs-list'],
    queryFn:  () => blogsApi.list({ limit: 1 }).then((r) => r.data),
  })
  
  const { data: activityRes } = useQuery({
    queryKey: ['recent-activities', activitySearch],
    queryFn:  () => activityApi.list({ limit: 5, search: activitySearch }).then((r) => r.data),
  })
  const activities = activityRes?.data || []

  return (
    <div className="space-y-5">
      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Admins"  value={usersData?.meta?.total ?? '—'} change={12}  icon={Users}     color="blue"   loading={!usersData && isSuperAdmin} />
        <StatCard title="Blog Posts" value={blogsData?.data?.total ?? 0} change={5}  icon={FileText}  color="green" />
        <StatCard title="Active Users"  value={websiteData?.activeUsers ?? '—'} icon={Users} color="purple" />
        <StatCard title="Bounce Rate"   value={websiteData ? `${websiteData.bounceRate}%` : '—'} icon={Globe} color="teal" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Website Traffic · 14 Days</h3>
              <p className="text-xs text-gray-400 mt-0.5">Live data · Daily unique visitors</p>
            </div>
            {websiteData?.dailyVisitors && (
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(websiteData.dailyVisitors[websiteData.dailyVisitors.length - 1]?.value || 0)}
                </p>
                <p className="text-xs font-medium text-green-500">+12.4% 14d</p>
              </div>
            )}
          </div>
          {!websiteData ? <div className="skeleton h-64 rounded-xl" /> : <AreaChart data={websiteData.dailyVisitors} height={256} />}
        </div>

        {/* Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <div className="relative w-40">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={activitySearch} 
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search..." 
                className="input-base pl-7 pr-2 py-1 text-xs" 
              />
            </div>
          </div>
          <div className="space-y-3.5">
            {activities.length > 0 ? (
              activities.map((a) => (
                <div key={a._id} className="flex gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', getActivityDotColor(a.type))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.action}</p>
                    {a.details && <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-0.5">{a.details}</p>}
                    <p className="text-xs text-gray-400">
                      {a.actor} · {formatTime(new Date(a.createdAt))} ({timeAgo(new Date(a.createdAt))})
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Weekly Traffic</h3>
          {!websiteData ? <div className="skeleton h-48 rounded-xl" /> : <BarChart data={websiteData.weeklyTraffic} height={200} />}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {websiteData?.trafficSources?.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}%</p>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}