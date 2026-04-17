import { BarChart as RC, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useThemeStore } from '@/store/themeStore'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-brand-600">{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export function BarChart({ data, dataKey = 'value', color = '#6366f1', height = 240 }) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const grid = isDark ? '#1f2937' : '#f3f4f6'
  const text = isDark ? '#9ca3af' : '#6b7280'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: text }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: text }} tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} cursor={{ fill: isDark ? '#1f2937' : '#f9fafb', radius: 6 }} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
          {data?.map((_, i) => <Cell key={i} fill={color} fillOpacity={0.9 - i * 0.05} />)}
        </Bar>
      </RC>
    </ResponsiveContainer>
  )
}