import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWebsiteAnalytics } from '@/hooks/useAnalytics'
import { WorldMap } from '@/components/charts/WorldMap'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { formatNumber, formatPercent } from '@/utils/formatters'
import { Users, Globe, MousePointerClick, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

const DAYS = [7, 14, 30]

export default function Analytics() {
  const [days, setDays] = useState(14)
  const { data: websiteData, isLoading } = useWebsiteAnalytics()

  return (
    <div className="space-y-5">
      {/* Website Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Total Page Views', v: websiteData ? formatNumber(websiteData.pageViews) : '—', s: 'All time', i: MousePointerClick, c: 'text-brand-500 bg-brand-50' },
          { l: 'Unique Visitors', v: websiteData ? formatNumber(websiteData.uniqueVisitors) : '—', s: 'All time', i: Globe, c: 'text-blue-500 bg-blue-50' },
          { l: 'Active Users', v: websiteData ? formatNumber(websiteData.activeUsers) : '—', s: 'Live right now', i: Users, c: 'text-green-500 bg-green-50' },
          { l: 'Avg Session (m:s)', v: websiteData?.avgSessionDuration || '—', s: 'Per user', i: Clock, c: 'text-purple-500 bg-purple-50' },
        ].map((item, idx) => (
          <motion.div key={item.l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.l}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{item.v}</p>
                <p className="text-xs text-gray-400 mt-1">{item.s}</p>
              </div>
              <div className={cn("p-2.5 rounded-xl dark:bg-opacity-10", item.c)}>
                <item.i size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Traffic Overview Chart */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Website Traffic Overview</h3>
            <p className="text-xs text-gray-500 mt-1">Unique visitors over the selected time period</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {DAYS.map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={cn('px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
                  days === d ? 'bg-white shadow-sm dark:bg-gray-700 text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200')}>
                {d} Days
              </button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="skeleton h-[300px] w-full rounded-xl" /> : <AreaChart data={websiteData?.dailyVisitors} height={300} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Traffic Sources */}
        <div className="card p-5 form-container">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Acquisition Sources</h3>
          <div className="space-y-5">
            {websiteData?.trafficSources?.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.value}%` }} 
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-brand-500 h-2 rounded-full" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 form-container">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Weekly Engagement</h3>
          {isLoading ? <div className="skeleton h-48 w-full rounded-xl" /> : <BarChart data={websiteData?.weeklyTraffic} height={200} />}
        </div>
      </div>

      {/* Global Visitors Map */}
      <div className="card p-5">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Live Global Visitors</h3>
          <p className="text-sm text-gray-500 mt-1">Interactive 3D visualization of your website's traffic distribution by country.</p>
        </div>
        <div className="h-[500px] w-full bg-blue-50/50 dark:bg-[#0a0a0a] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800/50">
          {websiteData?.visitorsByCountry ? (
            <WorldMap data={websiteData.visitorsByCountry} />
          ) : (
            <div className="skeleton w-full h-full" />
          )}
        </div>
      </div>
    </div>
  )
}