import { useState, useEffect } from 'react'
import QuiltGrid from './components/QuiltGrid'
import PixelEditor from './components/PixelEditor'
import { ref, set, onValue } from 'firebase/database'
import { db } from './firebase'

function App() {
  const [squares, setSquares] = useState(
    Array(36).fill(null).map(() =>
      Array(16).fill(null).map(() => Array(16).fill('#F5EFEE'))
    )
  )
  const [history, setHistory] = useState([])
  const [editingSquare, setEditingSquare] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [poweredUpSquares, setPoweredUpSquares] = useState(new Set())
  const [mobileMode, setMobileMode] = useState('scroll') // 'scroll' | 'drag'

  // Freeze viewport height on mount to prevent mobile browser recalculations
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${vh}px`)
    }

    // Set immediately
    setAppHeight()

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none'

    // Only recalculate on actual window resize (orientation change), not during interactions
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(setAppHeight, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  const saveToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(squares))])
  }

  const updateSquare = (index, newPixels) => {
    saveToHistory()
    const newSquares = [...squares]
    newSquares[index] = newPixels
    setSquares(newSquares)
    set(ref(db, 'squares'), newSquares)

    // Add powerup animation to this square
    setPoweredUpSquares(prev => new Set([...prev, index]))
  }

  const copySquarePattern = (fromIndex, toIndex) => {
    saveToHistory()

    // Copy pattern
    const newSquares = [...squares]
    newSquares[toIndex] = JSON.parse(JSON.stringify(squares[fromIndex]))
    setSquares(newSquares)
    set(ref(db, 'squares'), newSquares)

    // Remove powerup from source square (it's been used!)
    setPoweredUpSquares(prev => {
      const newSet = new Set(prev)
      newSet.delete(fromIndex)
      return newSet
    })

    // Show toast
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const undo = () => {
    if (history.length === 0) return

    const previousState = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))
    setSquares(previousState)
  }

  // Sync with Firebase
  useEffect(() => {
    const squaresRef = ref(db, 'squares')

    const unsubscribe = onValue(squaresRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSquares(data)
      }
    })

    return () => unsubscribe()
  }, [])

  // Keyboard shortcut for undo (only when not editing a square)
  useEffect(() => {
    // Don't add listener if pixel editor is open
    if (editingSquare !== null) return

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, editingSquare])

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8" style={{ backgroundColor: '#121212', overscrollBehavior: 'none' }}>
      <div className="max-w-6xl mx-auto">
        <div style={{
          display: 'flex',
          color: 'white',
          backgroundColor: '#c4a1a1ff',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #e5e7eb',
          padding: '12px 16px',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <h1 className="text-3xl font-bold text-gray-900"
          style={{
            fontSize: window.innerWidth < 375 ? '22px' : '28px',
            margin: 0
          }}>
            Pixel Quilt
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setShowChatModal(true)}
              style={{
                minWidth: '44px',
                height: '44px',
                padding: '10px',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                border: '2px solid #6b7280',
                borderRadius: '6px',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Chat"
            >
              💬
            </button>

            {editingSquare === null && (
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  backgroundColor: isPreviewMode ? '#3b82f6' : '#ffffff',
                  color: isPreviewMode ? '#ffffff' : '#1f2937',
                  border: '2px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{isPreviewMode ? '✓' : '👁'}</span>
                <span style={{ display: window.innerWidth < 375 ? 'none' : 'inline' }}>
                  {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div style={{
          overflow: isPreviewMode ? 'visible' : 'auto',
          overflowX: mobileMode === 'drag' ? 'hidden' : 'auto',
          overflowY: mobileMode === 'drag' ? 'hidden' : 'auto',
          width: '100%',
          height: isPreviewMode ? 'auto' : 'auto',
          maxHeight: isPreviewMode ? 'none' : 'calc(var(--app-height, 100vh) - 150px)',
          display: isPreviewMode ? 'flex' : 'block',
          alignItems: isPreviewMode ? 'center' : 'stretch',
          justifyContent: isPreviewMode ? 'center' : 'flex-start',
          padding: isPreviewMode ? '20px' : '0'
        }}>
          <QuiltGrid
            squares={squares}
            onSquareClick={(index) => setEditingSquare(index)}
            onPatternCopy={copySquarePattern}
            isPreviewMode={isPreviewMode}
            poweredUpSquares={poweredUpSquares}
            mobileMode={mobileMode}
          />
        </div>

        {showToast && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            fontSize: '14px'
          }}>
            Pattern copied! Press Cmd+Z to undo
          </div>
        )}

        {editingSquare !== null && (
          <PixelEditor
            pixels={squares[editingSquare]}
            allSquares={squares}
            squareIndex={editingSquare}
            onSave={(newPixels) => {
              updateSquare(editingSquare, newPixels)
              setEditingSquare(null)
            }}
            onClose={() => setEditingSquare(null)}
          />
        )}

        {showChatModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
            onClick={() => setShowChatModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                maxWidth: '500px',
                width: '90%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px'
              }}>
                It&apos;s Meg&apos;s birthday
              </h2>
              <button
                onClick={() => setShowChatModal(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Copy toggle button */}
        {!isPreviewMode && editingSquare === null && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <button
            onClick={() => setMobileMode(prev => prev === 'scroll' ? 'drag' : 'scroll')}
            aria-pressed={mobileMode === 'drag'}
            aria-label={mobileMode === 'drag' ? 'Exit drag mode' : 'Enter drag mode'}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              minWidth: '70px',
              minHeight: '44px',
              padding: '10px 16px',
              backgroundColor: mobileMode === 'drag' ? '#3b82f6' : '#ffffff',
              color: mobileMode === 'drag' ? '#ffffff' : '#6b7280',
              border: `2px solid ${mobileMode === 'drag' ? '#3b82f6' : '#d1d5db'}`,
              borderRadius: '22px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              transition: 'all 0.2s ease'
            }}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}

export default App
