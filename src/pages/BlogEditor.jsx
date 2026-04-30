import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Save, Image as ImageIcon, Link as LinkIcon, Type, FileText, CheckCircle, X, Sparkles, Globe, Eye, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { blogsApi } from '@/api/blogs.api'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
 
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com'

const blogSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  slug: z.string().min(3, 'Slug is required'),
  excerpt: z.string().min(10, 'Excerpt is required'),
  content: z.string().min(20, 'Content is too short'),
  blogImage: z.any().optional(),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional()
})

export default function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('narrative') // 'narrative' or 'seo'
  const [imagePreview, setImagePreview] = useState(null)

  const { data: existingBlog, isLoading: isFetching } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogsApi.get(id).then(r => r.data.data),
    enabled: isEdit
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      isActive: true,
      content: ''
    }
  })

  const watchedTitle = watch('title')
  const watchedSlug = watch('slug')
  const watchedExcerpt = watch('excerpt')
  const watchedContent = watch('content')
  const watchedIsActive = watch('isActive')
  const watchedMetaTitle = watch('metaTitle')
  const watchedMetaDescription = watch('metaDescription')
  const watchedMetaKeywords = watch('metaKeywords')

  const isSeoValid = useMemo(() => {
    return (watchedMetaTitle?.length >= 10) && (watchedMetaDescription?.length >= 50)
  }, [watchedMetaTitle, watchedMetaDescription])

  // Set form values if editing
  useEffect(() => {
    if (existingBlog) {
      Object.keys(existingBlog).forEach(key => {
        if (key !== 'blogImage') {
          setValue(key, existingBlog[key])
        }
      })
      if (existingBlog.blogImage) {
        setImagePreview(existingBlog.blogImage)
      }
    }
  }, [existingBlog, setValue])

  // Slug suggestion
  useEffect(() => {
    if (watchedTitle && !isEdit) {
      const timeout = setTimeout(() => {
        blogsApi.suggestSlug(watchedTitle).then(res => {
          setValue('slug', res.data.data.slug)
        })
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [watchedTitle, setValue, isEdit])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? blogsApi.update({ id, data }) : blogsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['blogs'])
      toast.success(isEdit ? 'Journal updated' : 'Article published')
      navigate('/blogs')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong')
  })

  const onSubmit = (data) => mutation.mutate(data)

  if (isEdit && isFetching) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl z-30 py-3 -mx-4 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Tooltip content="Return to Editorial Hub" position="right">
            <button onClick={() => navigate('/blogs')} className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all text-gray-500">
              <ChevronLeft size={18} />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight italic flex items-center gap-2">
              {isEdit ? 'Edit Blog Article' : 'Publish Blog Post'}
              <Sparkles className="text-brand-500" size={14} />
            </h1>
            <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">Professional Editorial Suite</p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!previewMode && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
             <button 
               onClick={() => setActiveTab('narrative')}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 activeTab === 'narrative' ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               Narrative
             </button>
             <button 
               onClick={() => setActiveTab('seo')}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 activeTab === 'seo' ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               SEO Strategy
             </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Tooltip content={previewMode ? "Return to editing mode" : "See live article preview"}>
            <button onClick={() => setPreviewMode(!previewMode)} className={cn("btn-secondary px-4 py-2 text-xs", previewMode && "bg-brand-50 text-brand-600 dark:bg-brand-900/20")}>
              <Eye size={16} /> {previewMode ? 'Editing' : 'Preview'}
            </button>
          </Tooltip>
          <Tooltip content={!isSeoValid ? "Complete SEO Strategy (Title & Desc) to unlock publication" : (isEdit ? "Persist current changes" : "Push article to live site")}>
            <button 
              onClick={handleSubmit(onSubmit)} 
              disabled={mutation.isPending || !isSeoValid} 
              className={cn(
                "btn-primary px-6 py-2 text-xs rounded-lg shadow-lg active:scale-95 transition-all",
                !isSeoValid ? "opacity-40 grayscale cursor-not-allowed shadow-none" : "shadow-brand-500/10"
              )}
            >
              {mutation.isPending ? <Spinner size="sm" /> : <><Save size={16} /> {isEdit ? 'Commit' : 'Publish'}</>}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6", (previewMode || activeTab === 'seo') && "block")}>
        {/* Main Editor Area */}
        <div className={cn("lg:col-span-8 space-y-6", (previewMode || activeTab === 'seo') && "hidden")}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-6 bg-white dark:bg-gray-900 border-none shadow-xl">
            <div className="space-y-1">
              <Tooltip content="The primary headline for your article" className="w-full">
                <input
                  {...register('title')}
                  placeholder="Creative Title..."
                  className="w-full bg-transparent text-xl md:text-2xl font-black focus:outline-none placeholder-gray-200 dark:placeholder-gray-800 tracking-tight"
                />
              </Tooltip>
              {errors.title && <p className="text-red-500 text-[10px] font-bold tracking-widest">{errors.title.message}</p>}
            </div>

            <RichTextEditor
              label="Narrative Body"
              value={watchedContent}
              onChange={(val) => setValue('content', val, { shouldValidate: true })}
              error={errors.content?.message}
              placeholder="The story starts here..."
            />

            <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => {
                  setActiveTab('seo');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-primary px-6 py-2.5 text-xs rounded-lg shadow-lg shadow-brand-500/10 active:scale-95 transition-all flex items-center gap-2"
              >
                Next: SEO Strategy <Sparkles size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Configuration */}
        <div className={cn("lg:col-span-4 space-y-6 sticky top-20 h-fit", (previewMode || activeTab === 'seo') && "hidden")}>
          {/* Publication Control */}
          <section className="card p-5 bg-brand-600 text-white border-none shadow-xl shadow-brand-500/5">
            <h3 className="font-bold mb-3 flex items-center justify-between text-base">
              Visibility <Globe size={14} />
            </h3>
            <Tooltip content={watchedIsActive ? "Article is currently public" : "Article is hidden from public"} className="w-full">
              <label className="flex items-center gap-3 p-2.5 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors border border-white/10">
                <div className={cn("w-10 h-5 rounded-full relative transition-colors", watchedIsActive ? "bg-white" : "bg-white/20")}>
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full transition-all", watchedIsActive ? "right-0.5 bg-brand-600" : "left-0.5 bg-white")} />
                  <input type="checkbox" {...register('isActive')} className="hidden" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{watchedIsActive ? 'Ready for Eyes' : 'Locked Draft'}</span>
              </label>
            </Tooltip>
          </section>

          {/* Identity & SEO */}
          <section className="card p-5 space-y-5">
            <label className="text-[8px] uppercase font-black tracking-[0.2em] text-gray-400">Metadata Nodes</label>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold flex items-center gap-2 text-gray-600 dark:text-gray-400"><ImageIcon size={12} /> Hero Aspect</label>
                <Tooltip content="Upload a high-fidelity image for the article header" className="w-full">
                  <div
                    onClick={() => document.getElementById('blogImage').click()}
                    className="aspect-video rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group relative overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          <ImageIcon size={16} />
                        </div>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center px-2">Capture Visual</span>
                      </>
                    )}
                    <input
                      id="blogImage"
                      type="file"
                      className="hidden"
                      {...register('blogImage', {
                        onChange: (e) => {
                          const file = e.target.files[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }
                      })}
                    />
                  </div>
                </Tooltip>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold flex items-center gap-2 text-gray-600 dark:text-gray-400"><LinkIcon size={12} /> URL Path (Slug)</label>
                <Tooltip content="The unique URL address for this article" className="w-full">
                  <input {...register('slug')} className="input-base text-[11px] font-mono !py-2 !rounded-lg" placeholder="slug-path" />
                </Tooltip>
                {errors.slug && <p className="text-red-500 text-[9px] font-bold tracking-tight">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold flex items-center gap-2 text-gray-600 dark:text-gray-400"><FileText size={12} /> Summary Hook</label>
                <Tooltip content="A short description used for social sharing and search results" className="w-full">
                  <textarea {...register('excerpt')} rows={3} className="input-base text-[11px] !py-2 !rounded-lg resize-none" placeholder="The short hook..." />
                </Tooltip>
                {errors.excerpt && <p className="text-red-500 text-[9px] font-bold tracking-tight">{errors.excerpt.message}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Live Preview Mode */}
        {previewMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-12 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-4">
                    {/* Cover Image */}
                    <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl relative group bg-gray-100 dark:bg-gray-800">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Globe size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                          <span className="badge !px-4 !py-1.5 !text-[10px] !font-black !uppercase !tracking-widest !rounded-xl shadow-lg backdrop-blur-md bg-brand-500/90 text-white">
                            Draft Preview
                          </span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter leading-[0.9]">
                      {watchedTitle || 'Untitled Perspective'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <section className="card p-5 space-y-4 bg-white dark:bg-gray-900 border-none shadow-xl">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black tracking-widest text-brand-500">Timeline</label>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                          <Calendar size={14} className="text-gray-300" />
                          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black tracking-widest text-brand-500">Neuro Path</label>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                          <LinkIcon size={12} className="flex-shrink-0" />
                          /{watchedSlug || 'no-slug'}
                        </div>
                      </div>
                    </section>
                    
                    <section className="card p-5 bg-gray-900 dark:bg-brand-950 border-none shadow-2xl">
                      <label className="text-[9px] uppercase font-black tracking-widest text-brand-400 block mb-2">Internal Hook</label>
                      <p className="text-xs text-brand-100 font-medium leading-relaxed italic">
                        "{watchedExcerpt || 'No summary hook defined...'}"
                      </p>
                    </section>
                  </div>
               </div>

               <div className="card p-10 bg-white dark:bg-gray-900 border-none shadow-2xl">
                  <div 
                    className="blog-narrative-content ql-editor !p-0"
                    dangerouslySetInnerHTML={{ __html: watchedContent }}
                  />
               </div>
            </div>
          </motion.div>
        )}

        {/* SEO Strategy Section */}
        {!previewMode && activeTab === 'seo' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="card p-6 space-y-6 bg-white dark:bg-gray-900 border-none shadow-xl">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                         <Sparkles size={16} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">SEO Configuration</h3>
                   </div>
                   
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ">Meta Title</label>
                       <input 
                         {...register('metaTitle')}
                         placeholder="The title shown in search results..."
                         className="input-base !rounded-2xl !py-3 !text-base"
                       />
                       <div className="flex justify-between items-center px-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Target: 50-60 characters</p>
                          <p className={cn("text-[9px] font-black tracking-widest uppercase", (watchedMetaTitle?.length > 60 || watchedMetaTitle?.length < 10) ? "text-red-500" : "text-green-500")}>
                            {watchedMetaTitle?.length || 0} CHR
                          </p>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Meta Description</label>
                       <textarea 
                         {...register('metaDescription')}
                         rows={5}
                         placeholder="The description shown in search results..."
                         className="input-base !rounded-2xl !py-4 resize-none !text-base leading-relaxed"
                       />
                       <div className="flex justify-between items-center px-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Target: 150-160 characters</p>
                          <p className={cn("text-[9px] font-black tracking-widest uppercase", (watchedMetaDescription?.length > 160 || watchedMetaDescription?.length < 50) ? "text-red-500" : "text-green-500")}>
                            {watchedMetaDescription?.length || 0} CHR
                          </p>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Focus Keywords</label>
                       <input 
                         {...register('metaKeywords')}
                         placeholder="Enter keywords separated by commas..."
                         className="input-base !rounded-2xl !py-4"
                       />
                       <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase px-1 italic">Separating by commas helps search nodes categorize your narrative</p>
                     </div>

                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Canonical URL</label>
                       <input 
                         {...register('canonicalUrl')}
                         placeholder="https://original-source.com/blog..."
                         className="input-base !rounded-2xl !py-4"
                       />
                       <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase px-1 italic">Define the primary source of this narrative to avoid duplicate content penalties</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Google Search Preview */}
               <div className="space-y-6">
                  <div className="card p-8 bg-white dark:bg-gray-900 border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                       <Globe size={160} className="text-gray-900 dark:text-white" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-gray-800 pb-5">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Search Result Simulator</h3>
                       <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400/20" />
                          <div className="w-2 h-2 rounded-full bg-yellow-400/20" />
                          <div className="w-2 h-2 rounded-full bg-green-400/20" />
                       </div>
                    </div>
                    
                    <div className="space-y-2 max-w-xl relative z-10">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[11px] font-black text-brand-500 shadow-sm">G</div>
                          <div className="flex flex-col">
                             <span className="text-[11px] text-gray-900 dark:text-gray-100 font-bold">Google Search</span>
                             <span className="text-[10px] text-gray-400 font-mono tracking-tight flex items-center gap-1">
                               {SITE_URL} <span className="text-gray-200">/</span> blogs <span className="text-gray-200">/</span> {watchedSlug || 'narrative-slug'}
                             </span>
                          </div>
                       </div>
                       <h4 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-bold leading-tight tracking-tight">
                         {watchedMetaTitle || watchedTitle || 'Narrative Title Appearance'}
                       </h4>
                       <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2 font-medium">
                         <span className="text-gray-400 mr-2 font-black italic">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —</span>
                         {watchedMetaDescription || watchedExcerpt || 'Craft a compelling meta description to increase click-through rates. This is how search engines summarize your story to the world.'}
                       </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Simulated Perspective</span>
                       <div className="flex items-center gap-4 text-gray-300">
                          <div className="flex gap-2"><div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" /><div className="w-12 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" /></div>
                       </div>
                    </div>
                  </div>

                  <div className="card p-6 bg-brand-600 text-white border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 opacity-10">
                       <Sparkles size={200} />
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                       <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-xl">
                          <Globe size={24} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-base font-black uppercase tracking-tighter italic">Global Discovery Nodes</h4>
                          <p className="text-[11px] text-brand-100 leading-relaxed font-medium">
                            Configuring SEO Strategy transforms your content into a discoverable asset. Unique metadata boosts your ranking in the global narrative network.
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
