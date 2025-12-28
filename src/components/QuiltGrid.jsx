import { useState, useEffect, useRef } from 'react'
import QuiltSquare from './QuiltSquare'

function QuiltGrid({ squares, onSquareClick, onPatternCopy, isPreviewMode = false, poweredUpSquares = new Set() }) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    sourceIndex: null,
    currentPos: null,
    hoveredIndex: null
  })

  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef(null)

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

  const handleDragStart = (index, pos) => {
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
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
          width: '100%',
          position: 'relative',
          touchAction: isPreviewMode ? 'auto' : 'none',
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
            isPoweredUp={poweredUpSquares.has(index)}
            isMobile={isMobile}
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
            gridTemplateColumns: 'repeat(16, 1fr)',
            gridTemplateRows: 'repeat(16, 1fr)',
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
