import { useState, useMemo, useEffect, useRef, useCallback } from 'react'

const COLORS = [
  // Row 1 - Pinks
  { value: '#F2D9E5' },
  { value: '#DCA3B9' },
  { value: '#D2437A' },
  { value: '#F9F8F4' },

  // Row 2 - Peach/Orange/Beige
  { value: '#FFD4C1' },
  { value: '#FFB88C' },
  { value: '#FF7D3D' },
  { value: '#D4C5A8' },

  // Row 3 - Yellow/Gold
  { value: '#F5E9B8' },
  { value: '#E4C259' },
  { value: '#C4A524' },
  { value: '#8B7518' },

  // Row 4 - Green
  { value: '#C8E6D0' },
  { value: '#86915D' },
  { value: '#40654A' },
  { value: '#2A4435' },

  // Row 5 - Blue
  { value: '#D4E8F5' },
  { value: '#7EB5D9' },
  { value: '#4A8AB8' },
  { value: '#224653' },

  // Row 6 - Purple/Gray
  { value: '#E8D9F5' },
  { value: '#B599D9' },
  { value: '#7D5BA8' },
  { value: '#D5DCDF' },

  // Row 7 - Black/Gray/White
  { value: '#000000' },
  { value: '#8B9199' },
  { value: '#4A5058' },
  { value: '#FFFFFF' },
]

const GRID_SIZE = 16
const DEBOUNCE_DELAY = 500 // ms

function PixelEditor({ pixels, allSquares, squareIndex, onSave, onClose }) {
  const [editedPixels, setEditedPixels] = useState(
    pixels.map(row => [...row])
  )
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [isMobile, setIsMobile] = useState(false)
  const [toolMode, setToolMode] = useState('draw') // 'draw' or 'bucket'
  const [hoverPixel, setHoverPixel] = useState(null)
  const [fillPreview, setFillPreview] = useState(new Set())
  const [justFilled, setJustFilled] = useState(false)
  const [localHistory, setLocalHistory] = useState([])

  // Drawing session tracking for debounced undo
  const drawingSessionStartRef = useRef(null)
  const debounceTimeoutRef = useRef(null)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const HALO_SIZE = isMobile ? 2 : 4
  const TOTAL_SIZE = HALO_SIZE + GRID_SIZE + HALO_SIZE

  // Calculate adjacent square indices (6-column layout)
  const adjacentSquares = useMemo(() => {
    const cols = 6
    const total = allSquares.length

    const top = squareIndex >= cols ? squareIndex - cols : null
    const bottom = squareIndex < total - cols ? squareIndex + cols : null
    const left = squareIndex % cols !== 0 ? squareIndex - 1 : null
    const right = (squareIndex + 1) % cols !== 0 ? squareIndex + 1 : null

    return {
      top,
      bottom,
      left,
      right,
      topLeft: top !== null && left !== null ? squareIndex - cols - 1 : null,
      topRight: top !== null && right !== null ? squareIndex - cols + 1 : null,
      bottomLeft: bottom !== null && left !== null ? squareIndex + cols - 1 : null,
      bottomRight: bottom !== null && right !== null ? squareIndex + cols + 1 : null,
    }
  }, [squareIndex, allSquares.length])

  // Build the complete grid with halo pixels
  const displayGrid = useMemo(() => {
    // Fix: Create unique objects for each cell instead of shallow copies
    const grid = Array(TOTAL_SIZE).fill(null).map(() =>
      Array(TOTAL_SIZE).fill(null).map(() => ({ color: '#FFFFFF', isHalo: true }))
    )

    // Fill main editable area (center 16x16)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[row + HALO_SIZE][col + HALO_SIZE] = {
          color: editedPixels[row][col],
          isHalo: false,
          row,
          col
        }
      }
    }

    // Fill top halo (last 4 rows of square above)
    if (adjacentSquares.top !== null) {
      const topSquare = allSquares[adjacentSquares.top]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          grid[row][col + HALO_SIZE] = {
            color: topSquare[GRID_SIZE - HALO_SIZE + row][col],
            isHalo: true
          }
        }
      }
    }

    // Fill bottom halo (first 4 rows of square below)
    if (adjacentSquares.bottom !== null) {
      const bottomSquare = allSquares[adjacentSquares.bottom]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          grid[HALO_SIZE + GRID_SIZE + row][col + HALO_SIZE] = {
            color: bottomSquare[row][col],
            isHalo: true
          }
        }
      }
    }

    // Fill left halo (last 4 columns of square to left)
    if (adjacentSquares.left !== null) {
      const leftSquare = allSquares[adjacentSquares.left]
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[row + HALO_SIZE][col] = {
            color: leftSquare[row][GRID_SIZE - HALO_SIZE + col],
            isHalo: true
          }
        }
      }
    }

    // Fill right halo (first 4 columns of square to right)
    if (adjacentSquares.right !== null) {
      const rightSquare = allSquares[adjacentSquares.right]
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[row + HALO_SIZE][HALO_SIZE + GRID_SIZE + col] = {
            color: rightSquare[row][col],
            isHalo: true
          }
        }
      }
    }

    // Fill top-left corner (bottom-right 4x4 of diagonal square)
    if (adjacentSquares.topLeft !== null) {
      const topLeftSquare = allSquares[adjacentSquares.topLeft]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[row][col] = {
            color: topLeftSquare[GRID_SIZE - HALO_SIZE + row][GRID_SIZE - HALO_SIZE + col],
            isHalo: true
          }
        }
      }
    }

    // Fill top-right corner (bottom-left 4x4 of diagonal square)
    if (adjacentSquares.topRight !== null) {
      const topRightSquare = allSquares[adjacentSquares.topRight]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[row][HALO_SIZE + GRID_SIZE + col] = {
            color: topRightSquare[GRID_SIZE - HALO_SIZE + row][col],
            isHalo: true
          }
        }
      }
    }

    // Fill bottom-left corner (top-right 4x4 of diagonal square)
    if (adjacentSquares.bottomLeft !== null) {
      const bottomLeftSquare = allSquares[adjacentSquares.bottomLeft]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[HALO_SIZE + GRID_SIZE + row][col] = {
            color: bottomLeftSquare[row][GRID_SIZE - HALO_SIZE + col],
            isHalo: true
          }
        }
      }
    }

    // Fill bottom-right corner (top-left 4x4 of diagonal square)
    if (adjacentSquares.bottomRight !== null) {
      const bottomRightSquare = allSquares[adjacentSquares.bottomRight]
      for (let row = 0; row < HALO_SIZE; row++) {
        for (let col = 0; col < HALO_SIZE; col++) {
          grid[HALO_SIZE + GRID_SIZE + row][HALO_SIZE + GRID_SIZE + col] = {
            color: bottomRightSquare[row][col],
            isHalo: true
          }
        }
      }
    }

    return grid
  }, [editedPixels, allSquares, adjacentSquares, HALO_SIZE, TOTAL_SIZE])

  // Flood fill algorithm
  const floodFill = (pixels, startRow, startCol, targetColor, fillColor) => {
    if (targetColor === fillColor) return pixels

    const newPixels = pixels.map(r => [...r])
    const stack = [[startRow, startCol]]
    const visited = new Set()

    while (stack.length > 0) {
      const [row, col] = stack.pop()
      const key = `${row},${col}`

      if (visited.has(key)) continue
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) continue
      if (newPixels[row][col] !== targetColor) continue

      visited.add(key)
      newPixels[row][col] = fillColor

      // Add adjacent cells (4-way connectivity)
      stack.push([row - 1, col])
      stack.push([row + 1, col])
      stack.push([row, col - 1])
      stack.push([row, col + 1])
    }

    return newPixels
  }

  // Get pixels that would be affected by flood fill (for preview)
  const getFloodFillPixels = (row, col, targetColor) => {
    if (editedPixels[row][col] !== targetColor) return new Set()
    if (targetColor === selectedColor) return new Set()

    const stack = [[row, col]]
    const visited = new Set()

    while (stack.length > 0) {
      const [r, c] = stack.pop()
      const key = `${r},${c}`

      if (visited.has(key)) continue
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue
      if (editedPixels[r][c] !== targetColor) continue

      visited.add(key)

      // Add adjacent cells
      stack.push([r - 1, c])
      stack.push([r + 1, c])
      stack.push([r, c - 1])
      stack.push([r, c + 1])
    }

    return visited
  }

  // Save current state to local history
  const saveToLocalHistory = () => {
    setLocalHistory(prev => [...prev, JSON.parse(JSON.stringify(editedPixels))])
  }

  // Start a drawing session if not already started
  const startDrawingSession = () => {
    if (!drawingSessionStartRef.current && toolMode === 'draw') {
      saveToLocalHistory()
      drawingSessionStartRef.current = true
    }
  }

  // Reset debounce timer - session continues
  const continueDrawingSession = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout to finalize the session
    debounceTimeoutRef.current = setTimeout(() => {
      drawingSessionStartRef.current = null
    }, DEBOUNCE_DELAY)
  }

  // Local undo within the pixel editor
  const handleLocalUndo = useCallback(() => {
    if (localHistory.length === 0) return

    const previousState = localHistory[localHistory.length - 1]
    setLocalHistory(prev => prev.slice(0, -1))
    setEditedPixels(previousState)
  }, [localHistory])

  // Keyboard shortcut for undo within pixel editor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleLocalUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleLocalUndo])

  const handlePixelClick = (row, col) => {
    if (toolMode === 'bucket') {
      saveToLocalHistory()
      const targetColor = editedPixels[row][col]
      const newPixels = floodFill(editedPixels, row, col, targetColor, selectedColor)
      setEditedPixels(newPixels)
      setFillPreview(new Set())

      // Trigger flash animation
      setJustFilled(true)
      setTimeout(() => setJustFilled(false), 300)
    } else {
      startDrawingSession()
      const newPixels = editedPixels.map(r => [...r])
      newPixels[row][col] = selectedColor
      setEditedPixels(newPixels)
      continueDrawingSession()
    }
  }

  const handlePixelEnter = (row, col) => {
    if (toolMode === 'bucket') {
      setHoverPixel({ row, col })
      const targetColor = editedPixels[row][col]
      const affectedPixels = getFloodFillPixels(row, col, targetColor)
      setFillPreview(affectedPixels)
    } else if (isDrawing) {
      startDrawingSession()
      const newPixels = editedPixels.map(r => [...r])
      newPixels[row][col] = selectedColor
      setEditedPixels(newPixels)
      continueDrawingSession()
    }
  }

  const handlePixelLeave = () => {
    if (toolMode === 'bucket') {
      setHoverPixel(null)
      setFillPreview(new Set())
    }
  }

  const handleClear = () => {
    saveToLocalHistory()
    setEditedPixels(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF')))
  }

  const handleRotateClockwise = () => {
    saveToLocalHistory()
    const newPixels = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'))
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newPixels[col][GRID_SIZE - 1 - row] = editedPixels[row][col]
      }
    }
    setEditedPixels(newPixels)
  }

  const handleRotateCounterClockwise = () => {
    saveToLocalHistory()
    const newPixels = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'))
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newPixels[GRID_SIZE - 1 - col][row] = editedPixels[row][col]
      }
    }
    setEditedPixels(newPixels)
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}>
        {/* Top Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #ddd',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Buttons on left */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onSave(editedPixels)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                backgroundColor: '#d1d5db',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRotateCounterClockwise}
              style={{
                padding: '8px 12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Rotate Counter-Clockwise"
            >
              ↺
            </button>
            <button
              onClick={handleRotateClockwise}
              style={{
                padding: '8px 12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Rotate Clockwise"
            >
              ↻
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>

          {/* Paint bucket and colors on right */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Paint bucket tool */}
            <button
              onClick={() => setToolMode(toolMode === 'bucket' ? 'draw' : 'bucket')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: toolMode === 'bucket' ? '#3b82f6' : 'white',
                border: '2px solid ' + (toolMode === 'bucket' ? '#3b82f6' : '#ddd'),
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
              aria-label="Paint Bucket Tool"
              title="Paint Bucket (Flood Fill)"
            >
              🪣
            </button>
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color.value,
                  border: selectedColor === color.value ? '3px solid #333' : '2px solid #ddd',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
                aria-label={color.value}
              />
            ))}
          </div>
        </div>

        {/* Canvas - tap outside to close */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            // Close if clicking the background
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <div
            style={{
              touchAction: 'none',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onTouchStart={() => setIsDrawing(true)}
            onTouchEnd={() => setIsDrawing(false)}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TOTAL_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${TOTAL_SIZE}, 1fr)`,
              gap: '0',
              backgroundColor: '#f5f5f5',
              width: '90vw',
              height: '90vw',
              maxWidth: '600px',
              maxHeight: '600px',
              aspectRatio: '1',
              position: 'relative'
            }}>
              {displayGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isPreviewPixel = !cell.isHalo && fillPreview.has(`${cell.row},${cell.col}`)
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      style={{
                        backgroundColor: cell.isHalo
                          ? cell.color
                          : cell.color,
                        border: cell.isHalo ? 'none' : '1px solid #e5e5e5',
                        cursor: cell.isHalo ? 'default' : (toolMode === 'bucket' ? 'crosshair' : 'pointer'),
                        position: 'relative'
                      }}
                      onMouseDown={() => !cell.isHalo && handlePixelClick(cell.row, cell.col)}
                      onMouseEnter={() => !cell.isHalo && handlePixelEnter(cell.row, cell.col)}
                      onMouseLeave={handlePixelLeave}
                      onTouchMove={(e) => {
                        if (cell.isHalo) return
                        const touch = e.touches[0]
                        const element = document.elementFromPoint(touch.clientX, touch.clientY)
                        if (element && element.dataset.row && !element.dataset.halo) {
                          handlePixelEnter(
                            parseInt(element.dataset.row),
                            parseInt(element.dataset.col)
                          )
                        }
                      }}
                      data-row={cell.isHalo ? undefined : cell.row}
                      data-col={cell.isHalo ? undefined : cell.col}
                      data-halo={cell.isHalo ? 'true' : undefined}
                    >
                      {isPreviewPixel && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: selectedColor,
                          opacity: 0.6,
                          pointerEvents: 'none'
                        }} />
                      )}
                    </div>
                  )
                })
              )}
              {/* Gradient overlays for halo */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 10%, rgba(255,255,255,0.4) 100%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                background: 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                height: '100%',
                background: 'linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                height: '100%',
                background: 'linear-gradient(to left, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                pointerEvents: 'none'
              }} />
              {/* Border overlay */}
              <div style={{
                position: 'absolute',
                top: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                left: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                width: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                height: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                border: '3px solid #333',
                pointerEvents: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 0 20px rgba(0,0,0,0.2)'
              }} />
              {/* Flash effect on fill */}
              {justFilled && (
                <div style={{
                  position: 'absolute',
                  top: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                  left: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                  width: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                  height: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                  backgroundColor: selectedColor,
                  opacity: 0.3,
                  pointerEvents: 'none',
                  animation: 'fadeOut 300ms ease-out',
                  boxSizing: 'border-box'
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      zIndex: 50
    }}>
      {/* Left side - 60% - Pixel Grid */}
      <div style={{
        width: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        minHeight: 0
      }}>
        <div
          style={{
            touchAction: 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${TOTAL_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${TOTAL_SIZE}, 1fr)`,
            gap: '0',
            backgroundColor: '#f5f5f5',
            width: 'min(100%, 100vh - 80px)',
            aspectRatio: '1',
            position: 'relative'
          }}>
            {displayGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isPreviewPixel = !cell.isHalo && fillPreview.has(`${cell.row},${cell.col}`)
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      backgroundColor: cell.isHalo
                        ? cell.color
                        : cell.color,
                      border: cell.isHalo ? 'none' : '1px solid #e5e5e5',
                      cursor: cell.isHalo ? 'default' : (toolMode === 'bucket' ? 'crosshair' : 'pointer'),
                      position: 'relative'
                    }}
                    onMouseDown={() => !cell.isHalo && handlePixelClick(cell.row, cell.col)}
                    onMouseEnter={() => !cell.isHalo && handlePixelEnter(cell.row, cell.col)}
                    onMouseLeave={handlePixelLeave}
                    onTouchMove={(e) => {
                      if (cell.isHalo) return
                      const touch = e.touches[0]
                      const element = document.elementFromPoint(touch.clientX, touch.clientY)
                      if (element && element.dataset.row && !element.dataset.halo) {
                        handlePixelEnter(
                          parseInt(element.dataset.row),
                          parseInt(element.dataset.col)
                        )
                      }
                    }}
                    data-row={cell.isHalo ? undefined : cell.row}
                    data-col={cell.isHalo ? undefined : cell.col}
                    data-halo={cell.isHalo ? 'true' : undefined}
                  >
                    {isPreviewPixel && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: selectedColor,
                        opacity: 0.6,
                        pointerEvents: 'none'
                      }} />
                    )}
                  </div>
                )
              })
            )}
            {/* Border overlay for editable area */}
            <div style={{
              position: 'absolute',
              top: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
              left: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
              width: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
              height: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
              border: '3px solid #333',
              pointerEvents: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }} />
            {/* Flash effect on fill */}
            {justFilled && (
              <div style={{
                position: 'absolute',
                top: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                left: `${(HALO_SIZE / TOTAL_SIZE) * 100}%`,
                width: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                height: `${(GRID_SIZE / TOTAL_SIZE) * 100}%`,
                backgroundColor: selectedColor,
                opacity: 0.3,
                pointerEvents: 'none',
                animation: 'fadeOut 300ms ease-out',
                boxSizing: 'border-box'
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Right side - 40% - Control Panel */}
      <div style={{
        width: '40%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100vh'
      }}>
        {/* Header - Fixed */}
        <div style={{
          padding: '40px 40px 20px 40px',
          flexShrink: 0
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '400',
            fontStyle: 'italic',
            marginBottom: '8px',
            fontFamily: 'Georgia, serif'
          }}>
            Edit square
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '24px',
            fontWeight: '400'
          }}>
            Draw a pattern or a symbol!
          </p>

          <div style={{ display: 'flex', gap: '0', marginBottom: '24px' }}>
            <button
              onClick={() => setToolMode('draw')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px 0 0 8px',
                border: '2px solid #ddd',
                borderRight: '1px solid #ddd',
                cursor: 'pointer',
                backgroundColor: toolMode === 'draw' ? '#e8e8ff' : 'white',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              ✏️ Draw
            </button>
            <button
              onClick={() => setToolMode('bucket')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '0 8px 8px 0',
                border: '2px solid #ddd',
                borderLeft: '1px solid #ddd',
                cursor: 'pointer',
                backgroundColor: toolMode === 'bucket' ? '#e8e8ff' : 'white',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🪣 Fill
            </button>
          </div>
        </div>

        {/* Scrollable Middle Section */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 40px',
          minHeight: 0
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            marginBottom: '24px',
            maxWidth: '220px'
          }}>
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  border: selectedColor === color.value ? '3px solid #333' : '2px solid #ddd',
                  cursor: 'pointer',
                  backgroundColor: color.value,
                  padding: 0,
                  transition: 'all 0.2s'
                }}
                aria-label={color.value}
              />
            ))}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div style={{
          padding: '20px 40px 40px 40px',
          flexShrink: 0,
          borderTop: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={handleClear}
              style={{
                flex: 2,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear Canvas
            </button>
            <button
              onClick={handleRotateClockwise}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                cursor: 'pointer',
                backgroundColor: 'white',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Rotate Clockwise"
            >
              <span style={{ fontSize: '20px' }}>↻</span>
              <span style={{ fontSize: '12px' }}>R</span>
            </button>
            <button
              onClick={handleRotateCounterClockwise}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                cursor: 'pointer',
                backgroundColor: 'white',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Rotate Counter-Clockwise"
            >
              <span style={{ fontSize: '20px' }}>↺</span>
              <span style={{ fontSize: '12px' }}>L</span>
            </button>
          </div>

          <button
            onClick={() => onSave(editedPixels)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '12px'
            }}
          >
            Save changes
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'white',
              color: '#333',
              border: '2px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default PixelEditor
