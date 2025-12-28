import { useState } from 'react'
import QuiltSquare from './QuiltSquare'

function QuiltGrid({ squares, onSquareClick, onPatternCopy, isPreviewMode = false, poweredUpSquares = new Set() }) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    sourceIndex: null,
    currentPos: null,
    hoveredIndex: null
  })

  const handleDragStart = (index, pos) => {
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
        className="quilt-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          width: '100%',
          position: 'relative',
          touchAction: dragState.isDragging ? 'none' : 'auto',
          transition: 'width 0.3s ease, border 0.3s ease',
          border: isPreviewMode ? '1px solid #d1d5db' : 'none'
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
          />
        ))}
      </div>

      {/* Ghost image during drag */}
      {dragState.isDragging && dragState.currentPos && (
        <div style={{
          position: 'fixed',
          left: dragState.currentPos.x,
          top: dragState.currentPos.y,
          width: '80px',
          height: '80px',
          pointerEvents: 'none',
          zIndex: 1000,
          opacity: 0.7,
          transform: 'translate(-50%, -50%)',
          border: '2px solid #3b82f6',
          backgroundColor: 'white'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(16, 1fr)',
            gridTemplateRows: 'repeat(16, 1fr)',
            gap: '0'
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
