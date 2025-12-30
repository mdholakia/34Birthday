import { useState, useEffect } from 'react'
import QuiltGrid from './components/QuiltGrid'
import PixelEditor from './components/PixelEditor'
import UndoIcon from './assets/icons/UndoIcon'
import EyeIcon from './assets/icons/EyeIcon'
import { ref, set, onValue } from 'firebase/database'
import { db } from './firebase'

function App() {
  const [squares, setSquares] = useState(
    Array(30).fill(null).map(() =>
      Array(15).fill(null).map(() => Array(15).fill('#F5EFEE'))
    )
  )
  const [history, setHistory] = useState([])
  const [editingSquare, setEditingSquare] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [mobileMode, setMobileMode] = useState('drag') // 'scroll' | 'drag'
  const [editCount, setEditCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show chat modal on first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedPixelQuilt')
    if (!hasVisitedBefore) {
      setShowChatModal(true)
      localStorage.setItem('hasVisitedPixelQuilt', 'true')
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
  }

  const copySquarePattern = (fromIndex, toIndex) => {
    saveToHistory()

    // Copy pattern
    const newSquares = [...squares]
    newSquares[toIndex] = JSON.parse(JSON.stringify(squares[fromIndex]))
    setSquares(newSquares)
    set(ref(db, 'squares'), newSquares)

    // Show toast
    setToastMessage('Pattern copied! Press Cmd+Z to undo')
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
          backgroundColor: '#121212',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #e5e7eb',
          padding: '12px 16px',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <h1 className="text-3xl font-bold"
          style={{
            fontSize: window.innerWidth < 375 ? '22px' : '28px',
            margin: 0,
            color: 'white',
            fontFamily: 'PPMondwest, sans-serif'
          }}>
            Pixel Quilt
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {editingSquare === null && (
              <button
                onClick={undo}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid #6b7280',
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
                title="Undo"
              >
                <UndoIcon color="white" size={20} />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={() => setShowChatModal(true)}
              style={{
                minWidth: '44px',
                height: '44px',
                padding: '10px',
                backgroundColor: 'transparent',
                color: 'white',
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

            {editingSquare === null && !isMobile && (
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  backgroundColor: isPreviewMode ? '#3b82f6' : 'transparent',
                  color: isPreviewMode ? '#ffffff' : 'white',
                  border: isPreviewMode ? '2px solid #3b82f6' : '2px solid #6b7280',
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
                {isPreviewMode ? (
                  <span>✓</span>
                ) : (
                  <EyeIcon color="white" size={20} />
                )}
                <span style={{ display: window.innerWidth < 375 ? 'none' : 'inline' }}>
                  {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div
          className="quilt-container"
          style={{
            overflow: 'visible',
            width: '100%',
            height: isPreviewMode ? 'calc(100vh - 80px)' : 'auto',
            display: isPreviewMode ? 'flex' : 'block',
            alignItems: isPreviewMode ? 'center' : 'stretch',
            justifyContent: isPreviewMode ? 'center' : 'flex-start',
            padding: isPreviewMode ? '20px' : '0'
          }}
        >
          <QuiltGrid
            squares={squares}
            onSquareClick={(index) => setEditingSquare(index)}
            onPatternCopy={copySquarePattern}
            isPreviewMode={isPreviewMode}
            mobileMode={mobileMode}
          />
        </div>

        {showToast && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            fontSize: '14px'
          }}>
            {toastMessage}
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

              // Show drag tutorial toast for first two edits
              if (editCount < 2) {
                setEditCount(prev => prev + 1)
                setToastMessage('Drag square to copy your design')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)
              }
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
              zIndex: 2000,
              padding: isMobile ? '20px' : '0'
            }}
            onClick={() => setShowChatModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: isMobile ? '24px' : '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                maxWidth: '500px',
                width: '90%',
                textAlign: 'left',
                maxHeight: isMobile ? '90vh' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#1f2937',
                lineHeight: '1.6'
              }}>
                <p>Welcome to my 6th annual birthday website!</p>

                <p>
                  This year, we're collaboratively creating a pixel art piece! 
                   I'll be getting the piece
                  woven by the good folks at{' '}
                  <a href="https://photoweavers.com/collections/all-products/products/60-x-50-small-woven-throw-portrait" style={{
                    color: '#006affff',
                    textDecoration: 'underline'
                  }}>
                    a North Carolina based mill
                  </a>{' '}
                  using a Jacquard loom; a reference to programming's origins in weaving. This is also a love letter to{' '}
                  <a href="http://red-green-blue.com/kid-pix-the-early-years" style={{
                    color: '#006affff',
                    textDecoration: 'underline'
                  }}>KidPix</a>, pixel art
                  (shoutout to Susan Kare, videogames, and geometric designs in folk art.)
                </p>

                <p>
                  This year was big one for me and next year is shaping up the same way. I'll treasure having your wishes and doodles as a tangible, snuggalable object.
                </p>
                <p>all my love,</p>
                <p>Meghna</p>
              </div>
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
                  marginTop: '20px',
                  width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Copy toggle button - Removed, using long-press only */}
      </div>
    </div>
  )
}

export default App
