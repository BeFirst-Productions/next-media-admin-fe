import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatTime = (d) => {
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'HH:mm') }
  catch { return '—' }
}

export const formatDate = (d) => {
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM dd, yyyy') }
  catch { return '—' }
}
export const formatDateTime = (d) => {
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM dd, yyyy HH:mm') }
  catch { return '—' }
}
export const timeAgo = (d) => {
  try { return formatDistanceToNow(typeof d === 'string' ? parseISO(d) : d, { addSuffix: true }) }
  catch { return '—' }
}
export const formatNumber = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`
  return String(n ?? 0)
}
export const formatCurrency = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0)
export const formatPercent = (n, d = 2) =>
  `${(n ?? 0) >= 0 ? '+' : ''}${(n ?? 0).toFixed(d)}%`
export const truncate = (s, l = 40) => s?.length > l ? `${s.slice(0, l)}…` : (s ?? '')