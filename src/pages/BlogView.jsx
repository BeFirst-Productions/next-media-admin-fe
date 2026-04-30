import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Edit2, Calendar, Globe, Link as LinkIcon, Clock, Sparkles } from 'lucide-react'
import { blogsApi } from '@/api/blogs.api'
import { Spinner } from '@/components/ui/Spinner'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

export default function BlogView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogsApi.get(id).then(r => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    )
  }

  if (!blog) return <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Narrative Not Found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between sticky top-0 z-30 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Tooltip content="Return to Editorial Hub" position="right">
            <button 
              onClick={() => navigate('/blogs')}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-brand-500 hover:border-brand-500/30 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Narrative Review</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center gap-1">
              Internal Audit Interface <Sparkles size={10} className="text-brand-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Hero Meta Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
           {/* Cover Image */}
           <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl relative group bg-gray-100 dark:bg-gray-800">
             {blog.blogImage ? (
               <img src={blog.blogImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-300">
                 <Globe size={48} />
               </div>
             )}
             <div className="absolute top-4 left-4">
                <span className={cn(
                  "badge !px-4 !py-1.5 !text-[10px] !font-black !uppercase !tracking-widest !rounded-xl shadow-lg backdrop-blur-md",
                  blog.isActive ? "bg-brand-500/90 text-white" : "bg-gray-900/90 text-white"
                )}>
                  {blog.isActive ? 'Publicly Visible' : 'Internal Only'}
                </span>
             </div>
           </div>
           
           <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter leading-[0.9]">
             {blog.title}
           </h2>
        </div>

        <div className="space-y-4">
           <section className="card p-5 space-y-4 bg-white dark:bg-gray-900 border-none shadow-xl">
             <div className="space-y-1">
               <label className="text-[9px] uppercase font-black tracking-widest text-brand-500">Timeline</label>
               <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                 <Calendar size={14} className="text-gray-300" />
                 {blog.createdAt ? format(new Date(blog.createdAt), 'MMMM dd, yyyy') : 'No Date'}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic pl-5">
                 <Clock size={10} /> {blog.createdAt ? format(new Date(blog.createdAt), 'hh:mm a') : 'No Time'}
               </div>
             </div>

             <div className="space-y-1">
               <label className="text-[9px] uppercase font-black tracking-widest text-brand-500">Neuro Path</label>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500 break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                 <LinkIcon size={12} className="flex-shrink-0" />
                 /{blog.slug}
               </div>
             </div>
           </section>
           
           <section className="card p-5 bg-gray-900 dark:bg-brand-950 border-none shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <Sparkles size={48} className="text-white" />
             </div>
             <label className="text-[9px] uppercase font-black tracking-widest text-brand-400 block mb-2">Internal Hook</label>
             <p className="text-xs text-brand-100 font-medium leading-relaxed italic relative z-10">
               "{blog.excerpt}"
             </p>
           </section>
        </div>
      </div>

      {/* Content Rendering */}
      <div className="card p-10 bg-white dark:bg-gray-900 border-none shadow-2xl">
        <div 
          className="blog-narrative-content ql-editor !p-0"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  )
}
