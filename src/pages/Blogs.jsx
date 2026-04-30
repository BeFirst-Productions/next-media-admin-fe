import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit2, Eye, Link as LinkIcon, Search, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, Calendar, ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { blogsApi } from '@/api/blogs.api'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/utils/cn'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com'

export default function Blogs() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(8)
  const [status, setStatus] = useState('all') // 'all', 'published', 'draft'

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page, search, limit, status],
    queryFn: () => blogsApi.list({ 
      page, 
      limit, 
      search,
      isActive: status === 'all' ? undefined : (status === 'published' ? 'true' : 'false')
    }).then(r => r.data)
  })

  const deleteMut = useMutation({
    mutationFn: blogsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(['blogs'])
      toast.success('Journal entry wiped')
      setDeleteTarget(null)
    }
  })

  const totalPages = Math.ceil((data?.data?.total || 0) / limit)

  return (
    <div className="space-y-10 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[9px] font-black uppercase tracking-widest">
            <Sparkles size={9} /> Editorial Hub
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight italic">
            Content Intelligence
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg text-[12px] leading-relaxed">
            Manage your narrative stream. Orchestrate {data?.data?.total || 0} unique perspectives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 mr-2">
            <button 
              onClick={() => { setStatus('all'); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                status === 'all' ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              All
            </button>
            <button 
              onClick={() => { setStatus('published'); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                status === 'published' ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Published
            </button>
            <button 
              onClick={() => { setStatus('draft'); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                status === 'draft' ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Drafts
            </button>
          </div>

          <Tooltip content="Search by title, excerpt, or slug">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Filter narratives..."
                className="input-base pl-9 py-1.5 text-[11px] w-full md:w-64 !rounded-lg"
              />
            </div>
          </Tooltip>
          <Tooltip content="Draft a new blog post">
            <button onClick={() => navigate('/blogs/new')} className="btn-primary !py-1.5 !px-4 !text-[11px] !rounded-lg">
              <Plus size={14} /> New Post
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Professional List View */}
      {isLoading ? (
        <div className="card overflow-hidden bg-white dark:bg-gray-900 border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4"><div className="skeleton h-3 w-8" /></th>
                  <th className="px-6 py-4"><div className="skeleton h-3 w-32" /></th>
                  <th className="px-6 py-4"><div className="skeleton h-3 w-16" /></th>
                  <th className="px-6 py-4"><div className="skeleton h-3 w-24" /></th>
                  <th className="px-6 py-4 text-right"><div className="skeleton h-3 w-20 ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-6 py-4"><div className="skeleton h-3 w-4" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-48" />
                          <div className="skeleton h-2 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="skeleton h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="skeleton h-3 w-20" />
                        <div className="skeleton h-2 w-16" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 text-right">
                        <div className="skeleton h-8 w-32 rounded-lg" />
                        <div className="skeleton h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden bg-white dark:bg-gray-900 border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16">SL No.</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Article Intelligence</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Publication Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {data?.data?.blogs?.map((blog, index) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-gray-400">
                          {String((page - 1) * limit + index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                            <img src={blog.blogImage} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{blog.title}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <LinkIcon size={10} className="text-brand-500" />
                              <span className="text-[10px] text-gray-400 font-mono">/{blog.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          blog.isActive
                            ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full", blog.isActive ? "bg-green-600 dark:bg-green-400 animate-pulse" : "bg-gray-400")} />
                          {blog.isActive ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{new Date(blog.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-400">{new Date(blog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Refine content and identity settings">
                            <button
                              onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                              <Edit2 size={12} /> Manage Article
                            </button>
                          </Tooltip>

                          <Tooltip content="Review the live version of this article">
                            <button
                              onClick={() => navigate(`/blogs/view/${blog._id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/10 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                          </Tooltip>

                          <Tooltip content="Delete">
                            <button
                              onClick={() => setDeleteTarget(blog)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Premium Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.data?.total || 0}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1); // Reset to first page when limit changes
        }}
      />

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Terminate Narrative" size="sm">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-[32px] flex items-center justify-center mx-auto border-2 border-red-100 dark:border-red-900/30">
            <Trash2 size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-xl text-gray-900 dark:text-gray-100 italic">Are you sure?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">
              This will permanently decommission <span className="font-bold text-gray-900 dark:text-gray-100 underline decoration-red-500/30">"{deleteTarget?.title}"</span> and all its metadata.
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 py-4 font-bold rounded-2xl">Abort</button>
            <button onClick={() => deleteMut.mutate(deleteTarget._id)} disabled={deleteMut.isPending} className="btn-danger flex-1 py-4 font-bold rounded-2xl shadow-xl shadow-red-500/20">
              {deleteMut.isPending ? <Spinner size="sm" /> : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
