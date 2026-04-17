import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/activity':  'Activity Logs',
  '/users':     'User Management',
  '/content':   'Content Management',
  '/settings':  'Settings',
}

export function Layout() {
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Admin Panel'
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full relative">
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}