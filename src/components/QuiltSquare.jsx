function QuiltSquare({ pixels, onClick, onDragStart, onMouseEnter, isSource, isHovered, index, isPreviewMode = false, isPoweredUp = false, isMobile = false }) {
  const checkLowerLeftCorner = (clientX, clientY, rect) => {
    const x = clientX - rect.left
    const y = clientY - rect.top
    // Much larger touch target on mobile (50% vs 20%)
    const threshold = isMobile ? 0.5 : 0.2
    return (x < rect.width * threshold) && (y > rect.height * (1 - threshold))
  }

  const handleMouseDown = (e) => {
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
    const rect = e.currentTarget.getBoundingClientRect()
    const isLowerLeft = checkLowerLeftCorner(touch.clientX, touch.clientY, rect)

    if (isLowerLeft) {
      e.preventDefault()
      e.stopPropagation()
      onDragStart({ x: touch.clientX, y: touch.clientY })
    }
  }

  const handleClick = (e) => {
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
      onMouseEnter={onMouseEnter}
      style={{
        width: '100%',
        aspectRatio: '1',
        backgroundColor: 'white',
        borderLeft: isPreviewMode ? 'none' : (isSource ? '3px solid #3b82f6' : isHovered ? '4px solid #10b981' : '1px solid #eee'),
        borderTop: isPreviewMode ? 'none' : (isSource ? '3px solid #3b82f6' : isHovered ? '4px solid #10b981' : '1px solid #eee'),
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isPreviewMode ? 'none' : (isSource ? '0 0 10px rgba(59, 130, 246, 0.5)' : isHovered ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none'),
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        transform: isHovered ? 'scale(0.98)' : 'scale(1)'
      }}
    >
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

          {/* Subtle corner indicator (always visible) */}
          {!isPoweredUp && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: isMobile ? '50%' : '20%',
              height: isMobile ? '50%' : '20%',
              borderLeft: isMobile ? '3px solid rgba(59, 130, 246, 0.5)' : '2px solid rgba(59, 130, 246, 0.3)',
              borderBottom: isMobile ? '3px solid rgba(59, 130, 246, 0.5)' : '2px solid rgba(59, 130, 246, 0.3)',
              pointerEvents: 'none',
              background: isMobile ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%)' : 'none'
            }} />
          )}

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
        </>
      )}
    </div>
  )
}

export default QuiltSquare
