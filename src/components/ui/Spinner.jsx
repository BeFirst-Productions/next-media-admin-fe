import { cn } from '@/utils/cn'
export function Spinner({ size = 'md', className }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-9 h-9' }
  return <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-brand-600', s[size], className)} />
}