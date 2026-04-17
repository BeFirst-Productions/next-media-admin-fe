import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BarChart3, Users, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Activity } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/users', label: 'Users', icon: Users, superAdminOnly: true },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isSuperAdmin, logout } = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useTheme()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  const items = NAV.filter((n) => !n.superAdminOnly || isSuperAdmin)

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0",
          mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[240px]",
          sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[240px]"
        )}
        style={{ boxShadow: '4px 0 24px -2px rgb(0 0 0 / 0.06)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <div className={cn("transition-opacity duration-200", sidebarCollapsed ? "lg:opacity-0 lg:hidden" : "opacity-100")}>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">AdminPanel</p>
            <p className="text-xs text-gray-400 whitespace-nowrap">Management System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}>
              {({ isActive }) => (
                <div className={cn('sidebar-item group relative', isActive && 'sidebar-item-active')}>
                  <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className={cn("whitespace-nowrap transition-all duration-200 origin-left", sidebarCollapsed ? "lg:hidden" : "block")}>
                    {label}
                  </span>

                  {/* Tailwind Custom Tooltip */}
                  {sidebarCollapsed && (
                    <div className="hidden lg:block absolute left-full ml-6 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-800 border border-gray-700 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      {label}
                      <div className="absolute top-1/2 -mt-1 -left-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-l border-b border-gray-700 transform rotate-45" />
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          ))}


        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5 w-full">
          <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', sidebarCollapsed && 'lg:justify-center lg:px-0')}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-700 dark:text-brand-400">
                {(user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
              </span>
            </div>
            <div className={cn("flex-1 min-w-0 transition-opacity duration-200", sidebarCollapsed ? "lg:hidden" : "block")}>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className={cn('sidebar-item text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group relative', sidebarCollapsed && 'lg:justify-center lg:px-0')}>
            <LogOut size={18} className="flex-shrink-0" />
            <span className={cn("transition-opacity duration-200", sidebarCollapsed ? "lg:hidden" : "block")}>Logout</span>
            {/* Tooltip */}
            {sidebarCollapsed && (
              <div className="hidden lg:block absolute left-full ml-6 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-800 border border-gray-700 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Logout
                <div className="absolute top-1/2 -mt-1 -left-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-l border-b border-gray-700 transform rotate-45" />
              </div>
            )}
          </button>
        </div>

        {/* Collapse btn */}
        <button onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 items-center justify-center shadow-sm hover:shadow z-40 transition-shadow">
          {sidebarCollapsed ? <ChevronRight size={12} className="text-gray-500" /> : <ChevronLeft size={12} className="text-gray-500" />}
        </button>
      </aside>
    </>
  )
}