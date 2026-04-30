import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'quill-paste-smart' // Improved paste handling
import { cn } from '@/utils/cn'

/**
 * RichTextEditor - A premium, reusable wrapper around ReactQuill
 * Optimized for admin editorial workflows with sticky toolbars and consistent styling.
 */
export function RichTextEditor({ 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = "Start writing your narrative...",
  className,
  stickyTop = "68px" // Default offset for the admin header
}) {
  
  // Memoized configuration to prevent unnecessary re-renders
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: { matchVisual: false }
  }), [])

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video', 'color', 'background', 'align', 'code-block'
  ]

  return (
    <div className={cn("space-y-3 flex flex-col group", className)}>
      {label && (
        <label className="text-[9px] uppercase font-black tracking-[0.3em] text-brand-500 transition-colors group-focus-within:text-brand-600">
          {label}
        </label>
      )}
      
      <div className={cn(
        "bg-gray-50 dark:bg-gray-900 rounded-2xl border transition-all duration-300 relative",
        error 
          ? "border-red-500/50 shadow-lg shadow-red-500/5" 
          : "border-gray-100 dark:border-gray-800 focus-within:border-brand-500/30 focus-within:shadow-xl focus-within:shadow-brand-500/5"
      )}>
        {/* We inject the stickyTop via a custom CSS variable for the global stylesheet to consume */}
        <div style={{ '--quill-sticky-top': stickyTop }}>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            className="blog-quill-editor"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-[10px] font-bold tracking-widest animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}
