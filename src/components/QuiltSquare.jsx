import { useState, useRef } from 'react'

function QuiltSquare({ pixels, onClick, onDragStart, onMouseEnter, isSource, isHovered, index, isPreviewMode = false, isPoweredUp = false, isMobile = false }) {
  const [isHovering, setIsHovering] = useState(false)
  const longPressTimer = useRef(null)
  const touchStartPos = useRef(null)

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
    // Mobile: long-press to drag, tap to open editor
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    // Start long-press timer (300ms)
    longPressTimer.current = setTimeout(() => {
      e.preventDefault()
      onDragStart({ x: touch.clientX, y: touch.clientY })
    }, 300)
  }

  const handleTouchMove = (e) => {
    // Cancel long-press if finger moves significantly
    if (longPressTimer.current && touchStartPos.current) {
      const touch = e.touches[0]
      const dx = touch.clientX - touchStartPos.current.x
      const dy = touch.clientY - touchStartPos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 10) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  const handleTouchEnd = () => {
    // Clear timer if released before long-press completes
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    touchStartPos.current = null
  }

  const handleClick = (e) => {
    // Desktop: only open editor if not clicking corner
    // Mobile: always open editor on tap (drag requires long-press)
    if (isMobile) {
      onClick()
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
        backgroundColor: 'white',
        borderLeft: isPreviewMode ? 'none' : '1px solid #eee',
        borderTop: isPreviewMode ? 'none' : '1px solid #eee',
        outline: isPreviewMode ? 'none' : (isSource ? '3px solid #3b82f6' : isHovered ? '4px solid #10b981' : 'none'),
        outlineOffset: isPreviewMode ? '0' : (isSource ? '-3px' : isHovered ? '-4px' : '0'),
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isPreviewMode ? 'none' : (isSource ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'),
        transition: 'outline 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box'
      }}
    >
      <>
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
          gridTemplateColumns: 'repeat(16, 1fr)',
          gridTemplateRows: 'repeat(16, 1fr)',
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
          <style>{`
            @keyframes cornerPulse {
              0%, 100% {
                background: radial-gradient(
                  circle at 0% 100%,
                  rgba(59, 130, 246, 0.8) 0%,
                  rgba(59, 130, 246, 0.4) 40%,
                  transparent 70%
                );
                transform: scale(1);
              }
              33% {
                background: radial-gradient(
                  circle at 0% 100%,
                  rgba(139, 92, 246, 0.9) 0%,
                  rgba(139, 92, 246, 0.5) 40%,
                  transparent 70%
                );
                transform: scale(1.1);
              }
              66% {
                background: radial-gradient(
                  circle at 0% 100%,
                  rgba(236, 72, 153, 0.8) 0%,
                  rgba(236, 72, 153, 0.4) 40%,
                  transparent 70%
                );
                transform: scale(1.05);
              }
            }

            @keyframes cornerGlow {
              0%, 100% {
                filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.8));
              }
              50% {
                filter: drop-shadow(0 0 8px rgba(139, 92, 246, 1));
              }
            }
          `}</style>


          {/* Powered-up corner glow (only after editing) */}
          {isPoweredUp && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: isMobile ? '50%' : '30%',
              height: isMobile ? '50%' : '30%',
              pointerEvents: 'none',
              animation: 'cornerPulse 2.5s ease-in-out infinite, cornerGlow 2.5s ease-in-out infinite',
              borderRadius: '0 100% 0 0',
              transformOrigin: 'bottom left'
            }} />
          )}

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
