import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Sun, Moon, Shield, User, Palette, Bell, Globe, Layout, Zap, Monitor, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { userApi } from '@/api/user.api'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { activityApi } from '@/api/activity.api'

const pwSchema = z.object({
  currentPassword: z.string().min(1,'Required'),
  newPassword:     z.string().min(8,'Min 8').regex(/[A-Z]/,'Needs uppercase').regex(/[0-9]/,'Needs number').regex(/[^A-Za-z0-9]/,'Needs symbol'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message:'Passwords do not match', path:['confirmPassword'] })

const ACCENT_COLORS = [
  { id:'indigo', label:'Indigo',  cls:'bg-indigo-500',  ring:'ring-indigo-500' },
  { id:'violet', label:'Violet',  cls:'bg-violet-500',  ring:'ring-violet-500' },
  { id:'blue',   label:'Blue',    cls:'bg-blue-500',    ring:'ring-blue-500' },
  { id:'teal',   label:'Teal',    cls:'bg-teal-500',    ring:'ring-teal-500' },
  { id:'green',  label:'Green',   cls:'bg-green-500',   ring:'ring-green-500' },
  { id:'rose',   label:'Rose',    cls:'bg-rose-500',    ring:'ring-rose-500' },
]

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <Icon size={16} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none',
          checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700')}
        style={{ height: 22, width: 40 }}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[18px]' : 'translate-x-0')} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { theme, setTheme: setThemeRaw, accentColor, setAccentColor: setAccentColorRaw, compactMode, setCompactMode, animationsEnabled, setAnimationsEnabled, sidebarCollapsed, toggleSidebar } = useThemeStore()

  const setTheme = (val) => {
    setThemeRaw(val);
    activityApi.create({ 
      action: `UI Theme updated`, 
      type: 'user', 
      details: `Changed system appearance to ${val} mode` 
    });
  }

  const setAccentColor = (val) => {
    setAccentColorRaw(val);
    activityApi.create({ 
      action: `Accent color updated`, 
      type: 'user',
      details: `Switched dashboard color profile to ${val}`
    });
  }

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(pwSchema) })
  const pwMut = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: async () => { 
      toast.success('Password updated')
      reset()
      const { useNotificationStore } = await import('@/store/notificationStore')
      useNotificationStore.getState().addNotification({
        title: 'Security Alert',
        message: 'Your password was successfully changed. If this wasn\'t you, please contact support immediately.',
        type: 'warning'
      })
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  })

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl font-bold text-brand-700 dark:text-brand-400 flex-shrink-0">
            {(user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{user?.name || '—'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={cn('badge mt-2', user?.role === 'superadmin' ? 'badge-purple' : 'badge-blue')}>{user?.role}</span>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        {/* Theme */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light',  label: 'Light',  icon: Sun },
              { value: 'dark',   label: 'Dark',   icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setTheme(value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value)}
                className={cn('flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all',
                  theme === value || (value === 'system' && false)
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400')}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Accent Color</p>
          <div className="flex gap-2.5 flex-wrap">
            {ACCENT_COLORS.map((ac) => (
              <button key={ac.id} onClick={() => { setAccentColor(ac.id); toast.success(`Accent set to ${ac.label}`) }}
                title={ac.label}
                className={cn('w-8 h-8 rounded-full transition-all', ac.cls, accentColor === ac.id ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ${ac.ring} scale-110` : 'opacity-70 hover:opacity-100')} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Color changes will apply after Tailwind config update in production.</p>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <Toggle checked={compactMode} onChange={setCompactMode} label="Compact mode" description="Reduces padding and spacing across the UI" />
          <Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} label="Animations" description="Page transitions and motion effects" />
          <Toggle checked={sidebarCollapsed} onChange={toggleSidebar} label="Collapsed sidebar" description="Start with sidebar in collapsed state" />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div className="space-y-3">
          <Toggle checked={true} onChange={() => toast('Coming soon')} label="Email alerts" description="Receive security and activity emails" />
          <Toggle checked={false} onChange={() => toast('Coming soon')} label="Browser notifications" description="Push notifications for important events" />
          <Toggle checked={true} onChange={() => toast('Coming soon')} label="Login alerts" description="Alert on new login from unknown device" />
        </div>
      </Section>

      {/* Layout */}
      <Section icon={Layout} title="Layout & Display">
        <div className="space-y-3">
          <Toggle checked={true} onChange={() => toast('Coming soon')} label="Show breadcrumbs" description="Navigation breadcrumb trail" />
          <Toggle checked={true} onChange={() => toast('Coming soon')} label="Show page titles" description="Display title in browser tab" />
          <Toggle checked={false} onChange={() => toast('Coming soon')} label="RTL mode" description="Right-to-left layout for Arabic/Hebrew" />
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security — Change Password">
        <form onSubmit={handleSubmit((d) => pwMut.mutate(d))} className="space-y-4" noValidate>
          {[
            { name:'currentPassword', label:'Current Password' },
            { name:'newPassword',     label:'New Password' },
            { name:'confirmPassword', label:'Confirm New Password' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input {...register(f.name)} type="password" className="input-base" autoComplete="new-password" />
              {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={pwMut.isPending} className="btn-primary">
            {pwMut.isPending ? <Spinner size="sm" /> : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* About */}
      <Section icon={Zap} title="About">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { l: 'Version',    v: 'v1.0.0' },
            { l: 'Build',      v: 'Production' },
            { l: 'Backend',    v: 'Node.js + Express' },
            { l: 'Database',   v: 'MongoDB' },
            { l: 'Auth',       v: 'JWT RS256' },
            { l: 'Framework',  v: 'React 18 + Vite' },
          ].map((row) => (
            <div key={row.l} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <span className="text-gray-500">{row.l}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{row.v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}