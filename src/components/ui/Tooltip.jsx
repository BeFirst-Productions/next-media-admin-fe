import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * Tooltip - Re-engineered with Portals to prevent clipping by overflow-hidden or overflow-auto parents.
 */
export function Tooltip({ children, content, position = 'top' }) {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [arrowStyle, setArrowStyle] = useState({})

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      })
    }
  }

  useEffect(() => {
    if (show) {
      updateCoords()
      window.addEventListener('scroll', updateCoords)
      window.addEventListener('resize', updateCoords)
    }
    return () => {
      window.removeEventListener('scroll', updateCoords)
      window.removeEventListener('resize', updateCoords)
    }
  }, [show])

  const getPositionStyles = () => {
    const gap = 8
    const MARGIN = 10
    let top = 0
    let left = 0
    let transform = ''

    // Initial positioning
    switch (position) {
      case 'top':
        top = coords.top - gap
        left = coords.left + coords.width / 2
        transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        top = coords.top + coords.height + gap
        left = coords.left + coords.width / 2
        transform = 'translateX(-50%)'
        break
      case 'right':
        top = coords.top + coords.height / 2
        left = coords.left + coords.width + gap
        transform = 'translateY(-50%)'
        break
      case 'left':
        top = coords.top + coords.height / 2
        left = coords.left - gap
        transform = 'translate(-100%, -50%)'
        break
    }

    // Dynamic Clamping and Arrow Alignment
    if (show && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const halfWidth = tooltipRect.width / 2
      
      let finalLeft = left
      let arrowOffset = 50 // percentage

      if (left - halfWidth < MARGIN) {
        finalLeft = halfWidth + MARGIN
        const shift = left - finalLeft
        arrowOffset = 50 + (shift / tooltipRect.width) * 100
      } else if (left + halfWidth > viewportWidth - MARGIN) {
        finalLeft = viewportWidth - halfWidth - MARGIN
        const shift = left - finalLeft
        arrowOffset = 50 + (shift / tooltipRect.width) * 100
      }

      left = finalLeft
      
      // Update Arrow Style
      const newArrowStyle = {
        left: `${Math.min(Math.max(arrowOffset, 10), 90)}%` // Clamp arrow within tooltip body
      }
      if (JSON.stringify(newArrowStyle) !== JSON.stringify(arrowStyle)) {
        setArrowStyle(newArrowStyle)
      }
    }

    return { top, left, transform }
  }

  return (
    <div 
      ref={triggerRef}
      className="inline-block w-fit h-fit"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && createPortal(
        <AnimatePresence>
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-[9999] pointer-events-none"
            style={getPositionStyles()}
          >
            <div className="relative px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-black rounded-lg shadow-2xl whitespace-nowrap">
              {content}
              <div 
                style={arrowStyle}
                className={cn(
                  "absolute border-4 border-transparent",
                  position === 'top' && "top-full -translate-x-1/2 border-t-gray-900 dark:border-t-gray-800",
                  position === 'bottom' && "bottom-full -translate-x-1/2 border-b-gray-900 dark:border-b-gray-800",
                  position === 'left' && "left-full -translate-y-1/2 border-l-gray-900 dark:border-l-gray-800",
                  position === 'right' && "right-full -translate-y-1/2 border-r-gray-900 dark:border-r-gray-800"
                )} 
              />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
