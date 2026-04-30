import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  onPageChange, 
  limit, 
  onLimitChange,
  limitOptions = [8, 16, 32, 50, 100]
}) {
  if (totalPages <= 1 && totalItems <= limitOptions[0]) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 3;
    
    // Always show page 1
    buttons.push(renderButton(1));

    if (currentPage > maxVisible + 1) {
      buttons.push(<span key="dots-1" className="w-8 h-8 flex items-center justify-center text-gray-400"><MoreHorizontal size={12} /></span>);
    }

    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        buttons.push(renderButton(i));
      }
    }

    if (currentPage < totalPages - maxVisible) {
      buttons.push(<span key="dots-2" className="w-8 h-8 flex items-center justify-center text-gray-400"><MoreHorizontal size={12} /></span>);
    }

    // Always show last page if more than 1
    if (totalPages > 1) {
      buttons.push(renderButton(totalPages));
    }

    return buttons;
  }

  const renderButton = (num) => (
    <button
      key={num}
      onClick={() => onPageChange(num)}
      className={cn(
        "w-8 h-8 rounded-full text-[11px] font-black transition-all duration-300",
        currentPage === num
          ? "bg-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110 z-10"
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-500"
      )}
    >
      {num}
    </button>
  );

  return (
    <div className="flex justify-center w-full mt-12 mb-4">
      <div className="inline-flex items-center gap-6 px-6 py-2.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-full shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Info & Limit Split */}
        <div className="flex items-center gap-4 pr-6 border-r border-gray-100 dark:border-gray-800">
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-0.5">Coverage</span>
             <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">
               {Math.min((currentPage - 1) * limit + 1, totalItems)}-{Math.min(currentPage * limit, totalItems)} <span className="text-gray-300 dark:text-gray-600">/</span> {totalItems}
             </span>
          </div>
          
          <div className="relative group">
            <select 
              value={limit} 
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="appearance-none bg-gray-50 dark:bg-gray-800/50 pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black text-gray-600 dark:text-gray-300 border-none focus:ring-1 focus:ring-brand-500/30 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {limitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <ChevronRight size={10} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-brand-500 disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {renderPageButtons()}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-brand-500 disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Jump Controls */}
        <div className="flex items-center gap-1 pl-6 border-l border-gray-100 dark:border-gray-800">
           <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-300 hover:text-brand-500 disabled:opacity-10 transition-colors"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-300 hover:text-brand-500 disabled:opacity-10 transition-colors"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}