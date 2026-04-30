import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit2, Eye, Image as ImageIcon, Link as LinkIcon, Type, AlignLeft, CheckCircle, Save, X, Lightbulb, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { servicesApi } from '@/api/services.api'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/utils/cn'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com'

const subheadingSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  description: z.string().min(1, 'Description is required'),
  points: z.array(z.string()).optional()
})

const whyChooseUsItemSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  description: z.string().min(1, 'Description is required')
})

const schema = z.object({
  title: z.string().min(3, 'Title is too short'),
  serviceHeading: z.string().min(3, 'Service heading is required'),
  slug: z.string().min(3, 'Slug is required'),
  excerpt: z.string().min(10, 'Excerpt is required'),
  serviceDescription: z.string().min(20, 'Description is too short'),
  serviceImage: z.any().optional(),
  subHeadings: z.array(subheadingSchema).min(1, 'At least one subheading is required'),
  whyChooseUs: z.object({
    description: z.string().min(10, 'Common description is required'),
    items: z.array(whyChooseUsItemSchema).min(1, 'At least one item is required')
  })
})

export default function Services() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(8)
  
  const { data, isLoading } = useQuery({
    queryKey: ['services', page, search, limit],
    queryFn: () => servicesApi.list({ page, limit, search }).then(r => r.data)
  })

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      subHeadings: [{ heading: '', description: '', points: [''] }],
      whyChooseUs: { description: '', items: [{ heading: '', description: '' }] }
    }
  })

  const { fields: subFields, append: appendSub, remove: removeSub } = useFieldArray({ control, name: 'subHeadings' })
  const { fields: whyFields, append: appendWhy, remove: removeWhy } = useFieldArray({ control, name: 'whyChooseUs.items' })

  const watchedTitle = watch('title')
  const watchedHeading = watch('serviceHeading')

  // Slug suggestion logic with simple debounce-like behavior
  useEffect(() => {
    if ((watchedTitle || watchedHeading) && !editTarget) {
      const timeout = setTimeout(() => {
        const base = watchedHeading || watchedTitle
        servicesApi.suggestSlug(base).then(res => {
          setValue('slug', res.data.data.slug)
        })
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [watchedTitle, watchedHeading, setValue, editTarget])

  const createMut = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries(['services'])
      toast.success('Service created')
      setShowModal(false)
      reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create')
  })

  const updateMut = useMutation({
    mutationFn: servicesApi.update,
    onSuccess: () => {
      qc.invalidateQueries(['services'])
      toast.success('Service updated')
      setShowModal(false)
      setEditTarget(null)
      reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update')
  })

  const deleteMut = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(['services'])
      toast.success('Service deleted')
      setDeleteTarget(null)
    }
  })

  const onSubmit = (data) => {
    if (editTarget) {
      updateMut.mutate({ id: editTarget._id, data })
    } else {
      createMut.mutate(data)
    }
  }

  const handleEdit = (service) => {
    setEditTarget(service)
    reset({
      ...service,
      serviceImage: undefined
    })
    setShowModal(true)
  }

  const handleView = (service) => {
    setViewTarget(service)
    setShowViewModal(true)
  }

  const totalPages = Math.ceil((data?.data?.total || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">Services Catalog</h2>
          <p className="text-sm text-gray-500 mt-1">Manage {data?.data?.total || 0} professional services</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search services..."
              className="input-base pl-10 py-2 text-sm w-full md:w-64"
            />
          </div>
          <button onClick={() => { setEditTarget(null); reset(); setShowModal(true); }} className="btn-primary">
            <Plus size={18} /> New Service
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden h-[420px] bg-white dark:bg-gray-900 border-none">
              <div className="skeleton h-48 w-full rounded-none" />
              <div className="p-6 space-y-4">
                 <div className="skeleton h-2 w-16" />
                 <div className="skeleton h-6 w-3/4" />
                 <div className="space-y-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                 </div>
                 <div className="pt-6 flex gap-3">
                    <div className="skeleton h-10 flex-1 rounded-xl" />
                    <div className="skeleton h-10 flex-1 rounded-xl" />
                    <div className="skeleton h-10 flex-1 rounded-xl" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.services?.map((service, index) => (
              <motion.div
                key={service._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card group overflow-hidden flex flex-col h-[420px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={service.serviceImage} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-4 right-5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black text-white">
                      {String((page - 1) * limit + index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-brand-500 text-[10px] font-bold text-white uppercase tracking-wider mb-2">Service</span>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{service.title}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {service.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <LinkIcon size={12} className="text-brand-500" />
                      <span className="truncate">{SITE_URL}/services/{service.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-5 border-t border-gray-50 dark:border-gray-800">
                    <button onClick={() => handleView(service)} className="btn-secondary flex-1 py-2.5 group/btn relative">
                      <Eye size={16} className="group-hover/btn:text-brand-500 transition-colors mx-auto" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        View Details
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                      </div>
                    </button>

                    <button onClick={() => handleEdit(service)} className="btn-secondary flex-1 py-2.5 group/btn relative">
                      <Edit2 size={16} className="group-hover/btn:text-brand-500 transition-colors mx-auto" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Edit Service
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                      </div>
                    </button>

                    <button onClick={() => setDeleteTarget(service)} className="btn-secondary flex-1 py-2.5 group/btn relative !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/10 transition-all">
                      <Trash2 size={16} className="mx-auto" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Delete
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            totalItems={data?.data?.total || 0}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </>
      )}

      {/* Detail View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Service Intelligence" size="xl">
        {viewTarget && (
          <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
              <img src={viewTarget.serviceImage} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <h3 className="text-3xl font-black text-white">{viewTarget.serviceHeading}</h3>
                <p className="text-brand-400 font-mono text-sm mt-1">{SITE_URL}/services/{viewTarget.slug}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-500 mb-3 block">Perspective</label>
                  <p className="text-gray-600 dark:text-gray-300 leading-loose text-lg font-light italic">"{viewTarget.excerpt}"</p>
                </section>

                <section>
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-500 mb-3 block">Deep Dive</label>
                  <div className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {viewTarget.serviceDescription}
                  </div>
                </section>

                <section className="space-y-6 pt-6">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-500 block">Core Architecture</label>
                  {viewTarget.subHeadings?.map((sub, i) => (
                    <div key={`view-sub-${i}`} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-brand-500/30 transition-colors">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2">{sub.heading}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{sub.description}</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sub.points?.map((pt, j) => pt && (
                          <li key={`view-pt-${i}-${j}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                            <CheckCircle size={14} className="text-brand-500 flex-shrink-0" />
                            <span className="truncate">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-brand-500 rounded-3xl text-white shadow-xl shadow-brand-500/20">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <CheckCircle size={20} /> Why Choose Us
                  </h4>
                  <p className="text-sm text-brand-100 mb-6 leading-relaxed">
                    {viewTarget.whyChooseUs?.description}
                  </p>
                  <div className="space-y-4">
                    {viewTarget.whyChooseUs?.items?.map((item, i) => (
                      <div key={`view-why-${i}`} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="font-bold text-sm mb-1">{item.heading}</p>
                        <p className="text-[11px] text-brand-100">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="btn-primary px-8">Close Overview</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal (Reusing existing one but wrapped for consistency) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Modify Service Architecture' : 'Architect New Service'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input {...register('title')} className="input-base pl-10" placeholder="e.g. Identity Design" />
              </div>
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label-base">Page Heading</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input {...register('serviceHeading')} className="input-base pl-10" placeholder="Hero section heading" />
              </div>
              {errors.serviceHeading && <p className="error-text">{errors.serviceHeading.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Slug System</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input {...register('slug')} className="input-base pl-10" placeholder="auto-generated-slug" />
              </div>
              {errors.slug && <p className="error-text">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="label-base">Visual Asset</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="file" {...register('serviceImage')} className="input-base pl-10 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100" />
              </div>
            </div>
          </div>

          <div>
            <label className="label-base">Quick Excerpt</label>
            <textarea {...register('excerpt')} rows={2} className="input-base" placeholder="Brief elevator pitch..." />
            {errors.excerpt && <p className="error-text">{errors.excerpt.message}</p>}
          </div>

          <div>
            <label className="label-base">Deep Narrative</label>
            <textarea {...register('serviceDescription')} rows={4} className="input-base" placeholder="Comprehensive detail report..." />
            {errors.serviceDescription && <p className="error-text">{errors.serviceDescription.message}</p>}
          </div>

          {/* Sub Headings */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <AlignLeft size={16} className="text-brand-500" /> Architecture Nodes
              </h4>
              <button type="button" onClick={() => appendSub({ heading: '', description: '', points: [''] })} className="text-xs text-brand-500 hover:underline flex items-center gap-1 font-bold">
                <Plus size={12} /> Add Node
              </button>
            </div>
            <div className="space-y-6">
              {subFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl relative group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  <button type="button" onClick={() => removeSub(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <input {...register(`subHeadings.${index}.heading`)} className="input-base bg-white dark:bg-gray-900" placeholder="Node Heading" />
                    <textarea {...register(`subHeadings.${index}.description`)} rows={1} className="input-base bg-white dark:bg-gray-900" placeholder="Node Description" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Node Capabilities (one per line)</label>
                    <textarea
                      {...register(`subHeadings.${index}.points`)}
                      className="input-base text-xs bg-white dark:bg-gray-900"
                      placeholder="Point 1&#10;Point 2"
                      rows={3}
                      onChange={(e) => {
                        const val = e.target.value.split('\n');
                        setValue(`subHeadings.${index}.points`, val);
                      }}
                      defaultValue={Array.isArray(field.points) ? field.points.join('\n') : ''}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h4 className="text-sm font-bold flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircle size={16} className="text-brand-500" /> Advantage System
            </h4>
            <div>
              <label className="label-base">Core Advantage Description</label>
              <textarea {...register('whyChooseUs.description')} rows={2} className="input-base" placeholder="Why we stand out..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whyFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl relative group bg-white dark:bg-gray-900/50">
                  <button type="button" onClick={() => removeWhy(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                  <input {...register(`whyChooseUs.items.${index}.heading`)} className="input-base mb-2 text-sm font-bold border-none p-0 focus:ring-0" placeholder="Advantage Title" />
                  <textarea {...register(`whyChooseUs.items.${index}.description`)} rows={2} className="input-base text-xs border-none p-0 focus:ring-0" placeholder="Context..." />
                </div>
              ))}
              <button type="button" onClick={() => appendWhy({ heading: '', description: '' })} className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center p-4 text-gray-400 hover:text-brand-500 hover:border-brand-500 transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-2 z-10">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 font-bold">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary flex-1 font-bold shadow-lg shadow-brand-500/20">
              {(createMut.isPending || updateMut.isPending) ? <Spinner size="sm" /> : <><Save size={18} /> {editTarget ? 'Commit Changes' : 'Initialize Service'}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="System Overwrite" size="sm">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/30">
            <Trash2 size={36} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Permanent Removal?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">Decommissioning <span className="font-bold text-gray-900 dark:text-gray-100 underline decoration-red-500/30">{deleteTarget?.title}</span> will erase all architecture nodes. Continue?</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Abort</button>
            <button onClick={() => deleteMut.mutate(deleteTarget._id)} disabled={deleteMut.isPending} className="btn-danger flex-1 shadow-lg shadow-red-500/20">
              {deleteMut.isPending ? <Spinner size="sm" /> : 'Confirm Deletion'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
