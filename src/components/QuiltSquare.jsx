function QuiltSquare({ pixels, onClick, onDragStart, onMouseEnter, isSource, isHovered, index }) {
  const checkLowerLeftCorner = (clientX, clientY, rect) => {
    const x = clientX - rect.left
    const y = clientY - rect.top
    return (x < rect.width * 0.2) && (y > rect.height * 0.8)
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
        border: isSource ? '3px solid #3b82f6' : isHovered ? '3px solid #10b981' : '1px solid #333',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isSource ? '0 0 10px rgba(59, 130, 246, 0.5)' : isHovered ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
        transition: 'border 0.1s, box-shadow 0.1s'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)',
        gridTemplateRows: 'repeat(16, 1fr)',
        gap: '0'
      }}>
        {pixels.map((row, rowIndex) =>
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

      {/* Visual indicator for drag corner */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '20%',
        height: '20%',
        borderLeft: '3px solid rgba(59, 130, 246, 0.3)',
        borderBottom: '3px solid rgba(59, 130, 246, 0.3)',
        pointerEvents: 'none'
      }} />
    </div>
  )
}

export default QuiltSquare
