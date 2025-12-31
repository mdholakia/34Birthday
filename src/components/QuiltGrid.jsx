import { useState, useEffect, useRef } from 'react'
import QuiltSquare from './QuiltSquare'

function QuiltGrid({ squares, onSquareClick, onPatternCopy, isPreviewMode = false, mobileMode = 'scroll' }) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    sourceIndex: null,
    currentPos: null,
    hoveredIndex: null
  })

  const [isMobile, setIsMobile] = useState(false)
  const [autoScroll, setAutoScroll] = useState({
    active: false,
    direction: { x: 0, y: 0 },
    velocity: 1
  })
  const containerRef = useRef(null)
  const autoScrollRaf = useRef(null)

  // Edge-based auto-scroll constants
  const EDGE_SCROLL_ZONE = 60 // px from edge to trigger scroll
  const MIN_SCROLL_VELOCITY = 2 // px per frame
  const MAX_SCROLL_VELOCITY = 12 // px per frame
  const VELOCITY_RAMP = 0.8 // How quickly velocity increases

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent any scrolling/address bar changes during drag
  useEffect(() => {
    if (!dragState.isDragging) return

    const preventScrolling = (e) => {
      // Prevent any scroll behavior that might trigger address bar
      if (e.cancelable) {
        e.preventDefault()
      }
    }

    // Add listeners with passive: false to allow preventDefault
    document.addEventListener('touchmove', preventScrolling, { passive: false })
    document.addEventListener('scroll', preventScrolling, { passive: false })

    return () => {
      document.removeEventListener('touchmove', preventScrolling)
      document.removeEventListener('scroll', preventScrolling)
    }
  }, [dragState.isDragging])

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll.active || !dragState.isDragging) {
      if (autoScrollRaf.current) {
        cancelAnimationFrame(autoScrollRaf.current)
        autoScrollRaf.current = null
      }
      return
    }

    const scrollContainer = containerRef.current?.parentElement
    if (!scrollContainer) return

    const performScroll = () => {
      if (autoScroll.active && scrollContainer) {
        scrollContainer.scrollBy({
          top: autoScroll.direction.y,
          left: 0,
          behavior: 'auto'
        })

        autoScrollRaf.current = requestAnimationFrame(performScroll)
      }
    }

    autoScrollRaf.current = requestAnimationFrame(performScroll)

    return () => {
      if (autoScrollRaf.current) {
        cancelAnimationFrame(autoScrollRaf.current)
      }
    }
  }, [autoScroll.active, autoScroll.direction, dragState.isDragging])

  const handleDragStart = (index, pos) => {
    // Haptic feedback on mobile - stronger pulse
    if (navigator.vibrate) {
      navigator.vibrate(150)
    }

    setDragState({
      isDragging: true,
      sourceIndex: index,
      currentPos: pos,
      hoveredIndex: null
    })
  }

  const handleDragMove = (pos) => {
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, currentPos: pos }))
    }
  }

  const handleDragEnd = () => {
    if (dragState.isDragging && dragState.hoveredIndex !== null &&
        dragState.hoveredIndex !== dragState.sourceIndex) {
      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30])
      }
      onPatternCopy(dragState.sourceIndex, dragState.hoveredIndex)
    }

    // Stop auto-scroll
    setAutoScroll({ active: false, direction: { x: 0, y: 0 }, velocity: 1 })

    setDragState({
      isDragging: false,
      sourceIndex: null,
      currentPos: null,
      hoveredIndex: null
    })
  }

  const handleSquareHover = (index) => {
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, hoveredIndex: index }))
    }
  }

  const handleTouchMove = (e) => {
    if (dragState.isDragging) {
      e.preventDefault() // Prevent scrolling while dragging
      const touch = e.touches[0]
      handleDragMove({ x: touch.clientX, y: touch.clientY })

      // Detect which square we're over
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const squareElement = element?.closest('[data-square-index]')
      if (squareElement) {
        const index = parseInt(squareElement.getAttribute('data-square-index'))
        handleSquareHover(index)
      }

      // Edge-based auto-scroll
      if (isMobile && mobileMode === 'drag') {
        const scrollContainer = containerRef.current?.parentElement
        if (!scrollContainer) return

        const viewportHeight = window.innerHeight
        const distanceFromTop = touch.clientY
        const distanceFromBottom = viewportHeight - touch.clientY

        let scrollY = 0

        if (distanceFromTop < EDGE_SCROLL_ZONE) {
          const proximity = 1 - (distanceFromTop / EDGE_SCROLL_ZONE)
          scrollY = -1 * (MIN_SCROLL_VELOCITY + (MAX_SCROLL_VELOCITY - MIN_SCROLL_VELOCITY) * Math.pow(proximity, VELOCITY_RAMP))
        } else if (distanceFromBottom < EDGE_SCROLL_ZONE) {
          const proximity = 1 - (distanceFromBottom / EDGE_SCROLL_ZONE)
          scrollY = (MIN_SCROLL_VELOCITY + (MAX_SCROLL_VELOCITY - MIN_SCROLL_VELOCITY) * Math.pow(proximity, VELOCITY_RAMP))
        }

        if (scrollY !== 0) {
          setAutoScroll({ active: true, direction: { x: 0, y: scrollY }, velocity: 1 })
        } else {
          setAutoScroll({ active: false, direction: { x: 0, y: 0 }, velocity: 1 })
        }
      }
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="quilt-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: '1fr',
          width: isPreviewMode ? 'min(100%, calc(100vh - 80px) * 6 / 8)' : '100%',
          maxHeight: isPreviewMode ? 'calc(100vh - 80px)' : 'none',
          aspectRatio: isPreviewMode ? '6 / 8' : 'auto',
          position: 'relative',
          touchAction: isPreviewMode ? 'auto' : (dragState.isDragging ? 'none' : 'manipulation'),
          contain: 'layout paint',
          transition: 'width 0.3s ease, border 0.3s ease',
          border: isPreviewMode ? '1px solid #d1d5db' : 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onMouseMove={(e) => handleDragMove({ x: e.clientX, y: e.clientY })}
        onMouseUp={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {squares.map((pixels, index) => (
          <QuiltSquare
            key={index}
            index={index}
            pixels={pixels}
            onClick={() => onSquareClick(index)}
            onDragStart={(pos) => handleDragStart(index, pos)}
            onMouseEnter={() => handleSquareHover(index)}
            isSource={dragState.isDragging && dragState.sourceIndex === index}
            isHovered={dragState.isDragging && dragState.hoveredIndex === index}
            isPreviewMode={isPreviewMode}
            isMobile={isMobile}
            mobileMode={mobileMode}
          />
        ))}
      </div>

      {/* Ghost image during drag */}
      {dragState.isDragging && dragState.currentPos && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate3d(${dragState.currentPos.x}px, ${dragState.currentPos.y}px, 0) translate(${isMobile ? '15px' : '10px'}, ${isMobile ? '-15px' : '-40px'})`,
          width: isMobile ? '80px' : '60px',
          height: isMobile ? '80px' : '60px',
          pointerEvents: 'none',
          zIndex: 1000,
          opacity: 0.9,
          border: '2px solid #3b82f6',
          borderRadius: isMobile ? '6px' : '4px',
          backgroundColor: 'white',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
          willChange: 'transform',
          contain: 'layout size paint'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(15, 1fr)',
            gridTemplateRows: 'repeat(15, 1fr)',
            gap: '0',
            borderRadius: isMobile ? '6px' : '2px',
            overflow: 'hidden'
          }}>
            {squares[dragState.sourceIndex].map((row, rowIndex) =>
              row.map((color, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    backgroundColor: color,
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

    </>
  )
}

export default QuiltGrid
