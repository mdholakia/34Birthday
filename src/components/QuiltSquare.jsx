import { useState, useRef } from 'react'

// Motion detection thresholds for mobile touch gestures
const HORIZONTAL_DRAG_THRESHOLD = 25 // px
const VERTICAL_SCROLL_THRESHOLD = 35 // px
const CANCEL_THRESHOLD = 10 // px

function QuiltSquare({ pixels, onClick, onDragStart, onMouseEnter, isSource, isHovered, index, isPreviewMode = false, isMobile = false, mobileMode = 'scroll' }) {
  const [isHovering, setIsHovering] = useState(false)
  const touchStartPos = useRef(null)
  const touchMode = useRef(null) // 'drag' | 'scroll' | null

  const checkLowerLeftCorner = (clientX, clientY, rect) => {
    const x = clientX - rect.left
    const y = clientY - rect.top
    const threshold = 0.2
    return (x < rect.width * threshold) && (y > rect.height * (1 - threshold))
  }

  const handleMouseDown = (e) => {
    if (isMobile) return // Desktop only

    const rect = e.currentTarget.getBoundingClientRect()
    const isLowerLeft = checkLowerLeftCorner(e.clientX, e.clientY, rect)

    if (isLowerLeft) {
      e.preventDefault()
      e.stopPropagation()
      onDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchMode.current = null // Reset mode for new touch
  }

  const handleTouchMove = (e) => {
    if (!touchStartPos.current) return

    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)

    // Ignore tiny movements (finger jitter)
    if (dx < CANCEL_THRESHOLD && dy < CANCEL_THRESHOLD) return

    // In drag mode (now the default): simple drag to copy
    if (mobileMode === 'drag') {
      if (dx > HORIZONTAL_DRAG_THRESHOLD || dy > HORIZONTAL_DRAG_THRESHOLD) {
        touchMode.current = 'drag'
        e.preventDefault()
        onDragStart({ x: touch.clientX, y: touch.clientY })
      }
    }
  }

  const handleTouchEnd = () => {
    // If no mode was chosen, treat as tap → open editor
    if (touchStartPos.current && touchMode.current === null) {
      onClick()
    }

    // Reset for next touch
    touchStartPos.current = null
    touchMode.current = null
  }

  const handleClick = (e) => {
    // Desktop: only open editor if not clicking corner
    // Mobile: handled by handleTouchEnd (not this click handler)
    if (isMobile) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const isLowerLeft = checkLowerLeftCorner(e.clientX, e.clientY, rect)

    if (!isLowerLeft) {
      onClick()
    }
  }

  return (
    <div
      data-square-index={index}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseEnter={() => {
        setIsHovering(true)
        onMouseEnter()
      }}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        width: '100%',
        aspectRatio: '1',
        backgroundColor: '#F5EFEE',
        borderLeft: isPreviewMode ? 'none' : '1px solid #d1d5db',
        borderTop: isPreviewMode ? 'none' : '1px solid #d1d5db',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isPreviewMode ? 'none' : (isSource ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'),
        transition: 'box-shadow 0.15s ease, transform 0.1s ease-out',
        boxSizing: 'border-box',
        touchAction: isMobile ? (mobileMode === 'drag' ? 'none' : 'auto') : 'auto',
        transform: 'scale(1)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <>
        {/* Source border overlay */}
        {isSource && !isPreviewMode && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '3px solid #3b82f6',
            pointerEvents: 'none',
            zIndex: 2,
            boxSizing: 'border-box'
          }} />
        )}

        {/* Hover scrim overlay */}
        {isHovered && !isPreviewMode && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(16, 185, 129, 0.3)',
            pointerEvents: 'none',
            zIndex: 1
          }} />
        )}

        <div style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(15, 1fr)',
          gridTemplateRows: 'repeat(15, 1fr)',
          gap: '0',
          lineHeight: '0',
          imageRendering: 'pixelated',
          WebkitFontSmoothing: 'none',
          isolation: 'isolate'
        }}>
          {pixels.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  backgroundColor: color,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  margin: '0',
                  padding: '0',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ))
          )}
        </div>

        {/* Visual indicator for drag corner */}
        {!isPreviewMode && (
        <>
          {/* Copy icon on desktop hover */}
          {!isMobile && isHovering && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              fontSize: '32px',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 2,
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
              transition: 'opacity 0.15s ease',
              lineHeight: '1'
            }}>
              ⎘
            </div>
          )}

        </>
        )}
      </>
    </div>
  )
}

export default QuiltSquare
