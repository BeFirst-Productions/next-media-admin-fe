import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ToggleLeft, ToggleRight, Search, UserCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { userApi } from '@/api/user.api'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const schema = z.object({
  name:     z.string().min(2, 'Min 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars').regex(/[A-Z]/,'Needs uppercase').regex(/[0-9]/,'Needs number').regex(/[^A-Za-z0-9]/,'Needs symbol'),
})

export default function Users() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admins', page, search],
    queryFn:  () => userApi.list({ page, limit: 10, search }).then((r) => r.data),
    keepPreviousData: true,
  })

  const createMut = useMutation({ mutationFn: userApi.create,
    onSuccess: () => { qc.invalidateQueries(['admins']); toast.success('Admin created'); setShowCreate(false); reset() } })
  const toggleMut = useMutation({ mutationFn: userApi.toggle,
    onSuccess: () => { qc.invalidateQueries(['admins']); toast.success('Status updated') } })
  const deleteMut = useMutation({ mutationFn: userApi.delete,
    onSuccess: () => { qc.invalidateQueries(['admins']); toast.success('Admin deleted'); setDeleteTarget(null) } })

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema) })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">Superadmin access only · {data?.meta?.total ?? 0} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> Add Admin
        </button>
      </div>

      <div className="card p-5">
        <div className="relative mb-4 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search admins…" className="input-base pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Admin','Role','Status','Created','Actions'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading
                ? Array.from({length:5}).map((_,i)=>(
                    <tr key={i}>{Array.from({length:5}).map((_,j)=>(
                      <td key={j} className="py-4 px-4"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}</tr>
                  ))
                : data?.data?.map((admin) => (
                    <motion.tr key={admin._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                              {(admin.name?.[0] || admin.email?.[0] || 'A').toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{admin.name}</p>
                            <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn('badge', admin.role==='superadmin'?'badge-purple':'badge-blue')}>{admin.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn('badge', admin.isActive?'badge-green':'badge-red')}>{admin.isActive?'Active':'Inactive'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{formatDate(admin.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleMut.mutate(admin._id)} disabled={admin.role==='superadmin' || toggleMut.isPending}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30" title={admin.isActive?'Deactivate':'Activate'}>
                            {admin.isActive ? <ToggleRight size={17} className="text-green-500" /> : <ToggleLeft size={17} className="text-gray-400" />}
                          </button>
                          <button onClick={() => setDeleteTarget(admin)} disabled={admin.role==='superadmin'}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-30">
                            <Trash2 size={15} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
              }
              {!isLoading && data?.data?.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center text-gray-400">No admins found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />
      </div>

      {/* Create */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); reset() }} title="Create Admin Account">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4" noValidate>
          {[
            { name:'name',     label:'Full Name',  type:'text',     placeholder:'John Doe' },
            { name:'email',    label:'Email',       type:'email',    placeholder:'admin@example.com' },
            { name:'password', label:'Password',    type:'password', placeholder:'Min 8 chars · uppercase · number · symbol' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="input-base" />
              {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name].message}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowCreate(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary flex-1">
              {createMut.isPending ? <Spinner size="sm" /> : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Admin" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deleteTarget?.name}</span>? This is permanent.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteMut.mutate(deleteTarget?._id)} disabled={deleteMut.isPending} className="btn-danger flex-1">
            {deleteMut.isPending ? <Spinner size="sm" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}