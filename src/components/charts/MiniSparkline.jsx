import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

export function MiniSparkline({ data, color = '#6366f1', height = 40 }) {
  const d = (data || []).map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={d}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length
              ? <div className="bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded shadow border border-gray-100 dark:border-gray-700">
                  ${Number(payload[0]?.value).toLocaleString()}
                </div>
              : null
          }
        />
      </LineChart>
    </ResponsiveContainer>
  )
}