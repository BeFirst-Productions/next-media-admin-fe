import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export default function Login() {
  const { login, loginLoading } = useAuth()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }) }, [isAuthenticated])

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-200/50 dark:shadow-brand-900/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="admin@example.com" className="input-base pl-10" autoComplete="email" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-base pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loginLoading} className="btn-primary w-full py-3 mt-2">
              {loginLoading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">Secured · JWT Auth · RBAC</p>
      </motion.div>
    </div>
  )
}