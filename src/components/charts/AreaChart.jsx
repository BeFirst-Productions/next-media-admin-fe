import { AreaChart as RC, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'
import { useThemeStore } from '@/store/themeStore'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="text-gray-500 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export function AreaChart({ data, dataKey = 'value', trendKey = 'trend', color = '#6366f1', height = 280 }) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const grid = isDark ? '#1f2937' : '#f3f4f6'
  const text = isDark ? '#9ca3af' : '#6b7280'
  const anomalies = data?.filter((d) => d.isAnomaly) || []

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`g_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: text }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: text }} tickLine={false} axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          fill={`url(#g_${dataKey})`} dot={false} activeDot={{ r: 4, fill: color }} />
        {trendKey && (
          <Area type="monotone" dataKey={trendKey} stroke={color} strokeWidth={1.5}
            strokeDasharray="5 5" fill="none" dot={false} opacity={0.45} />
        )}
        {anomalies.map((d, i) => (
          <ReferenceDot key={i} x={d.date} y={d.value} r={5}
            fill="#ef4444" stroke="white" strokeWidth={2}
            label={{ value: '!', fill: 'white', fontSize: 8 }} />
        ))}
      </RC>
    </ResponsiveContainer>
  )
}