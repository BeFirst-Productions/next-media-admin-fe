import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Globe, Tag, Brain, Clock, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { contentApi } from '@/api/content.api'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatters'
import { scoreContentSentiment } from '@/utils/aiHelpers'
import { cn } from '@/utils/cn'

const schema = z.object({
  title:   z.string().min(3,'Min 3 chars').max(200),
  body:    z.string().min(10,'Min 10 chars'),
  excerpt: z.string().max(500).optional(),
})

const SENT = { positive: 'badge-green', negative: 'badge-red', neutral: 'badge-yellow' }

export default function Content() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ 
    queryKey: ['content', search], 
    queryFn: () => contentApi.list({ search }).then((r) => r.data) 
  })
  const createMut  = useMutation({ mutationFn: contentApi.create,
    onSuccess: () => { qc.invalidateQueries(['content']); toast.success('Post created'); setShowCreate(false); reset() } })
  const publishMut = useMutation({ mutationFn: contentApi.publish,
    onSuccess: () => { qc.invalidateQueries(['content']); toast.success('Published!') } })
  const deleteMut  = useMutation({ mutationFn: contentApi.delete,
    onSuccess: () => { qc.invalidateQueries(['content']); toast.success('Deleted'); setDeleteTarget(null) } })

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({ resolver: zodResolver(schema) })
  const liveBody = watch('body', '')
  const sentiment = scoreContentSentiment(liveBody)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Content</h2>
          <p className="text-sm text-gray-500 mt-0.5">{data?.data?.length ?? 0} posts · AI sentiment analysis enabled</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-48 hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search content..." 
              className="input-base pl-9 py-1.5 text-sm" 
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Post</button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.data?.map((post, index) => {
            const sent = scoreContentSentiment(post.body)
            return (
              <motion.div key={post._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className="card card-hover p-5 flex flex-col gap-3 relative">
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 z-10">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{post.title}</h3>
                  <span className={cn('badge flex-shrink-0', post.isPublished?'badge-green':'badge-yellow')}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {post.excerpt && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>}
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn('badge', SENT[sent.label])}><Brain size={10} /> {sent.label}</span>
                  {post.tags?.slice(0,2).map((t) => <span key={t} className="badge badge-blue"><Tag size={10} />{t}</span>)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                  <Clock size={11} />{formatDate(post.createdAt)}
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {!post.isPublished && (
                    <button onClick={() => publishMut.mutate(post._id)} disabled={publishMut.isPending}
                      className="btn-primary flex-1 py-2 text-xs"><Globe size={13} /> Publish</button>
                  )}
                  <button onClick={() => setDeleteTarget(post)}
                    className="btn-secondary flex-1 py-2 text-xs !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/10">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            )
          })}
          {!isLoading && data?.data?.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">No content yet. Create your first post.</div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); reset() }} title="New Content Post" size="lg">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input {...register('title')} placeholder="Post title…" className="input-base" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Excerpt <span className="text-gray-400 font-normal">(optional)</span></label>
            <input {...register('excerpt')} placeholder="Short summary…" className="input-base" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
              {liveBody && <span className={cn('badge', SENT[sentiment.label])}><Brain size={10} /> AI: {sentiment.label}</span>}
            </div>
            <textarea {...register('body')} rows={6} placeholder="Write your content…" className="input-base resize-none" />
            {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowCreate(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary flex-1">
              {createMut.isPending ? <Spinner size="sm" /> : 'Create Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Post" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deleteTarget?.title}</span>? Permanent.
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