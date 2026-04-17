import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Bell, X, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { detectSearchIntent } from '@/utils/aiHelpers'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/utils/cn'

export function Navbar({ title, onMenuClick }) {
  const { isDark, toggleTheme } = useTheme()
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore()
  const unreadCount = notifications.filter(n => !n.read).length
  const [showNotifs, setShowNotifs] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => { setSuggestion(detectSearchIntent(query)) }, [query])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setQuery('') }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 sm:px-6 gap-2 sm:gap-4 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 mr-auto whitespace-nowrap overflow-hidden text-ellipsis md:block">{title}</h1>

      {/* AI smart search */}
      <div ref={ref} className="relative hidden sm:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && suggestion) { navigate(suggestion.route); setQuery('') } }}
            placeholder="AI search… try 'show analytics'"
            className="pl-8 pr-8 py-2 w-48 lg:w-56 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        <AnimatePresence>
          {suggestion && query && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-full mt-1.5 left-0 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg p-3 z-50">
              <p className="text-xs text-gray-400 mb-1.5">AI suggestion</p>
              <button onClick={() => { navigate(suggestion.route); setQuery('') }}
                className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                → Go to {suggestion.label}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button 
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative btn-ghost p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Bell size={17} />
          {unreadCount > 0 && <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-80 max-h-[400px] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl z-50">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                <span className="font-semibold text-sm">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} className={cn("p-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", !n.read && "bg-brand-50/50 dark:bg-brand-900/10")}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block",
                          n.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          n.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(n.date).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={toggleTheme} className="btn-ghost p-2">
        {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-gray-500" />}
      </button>
    </header>
  )
}