import { useState, useEffect } from 'react'
import QuiltGrid from './components/QuiltGrid'
import PixelEditor from './components/PixelEditor'
import { ref, set, onValue } from 'firebase/database'
import { db } from './firebase'

function App() {
  const [squares, setSquares] = useState(
    Array(36).fill(null).map(() =>
      Array(16).fill(null).map(() => Array(16).fill('white'))
    )
  )
  const [history, setHistory] = useState([])
  const [editingSquare, setEditingSquare] = useState(null)
  const [showToast, setShowToast] = useState(false)

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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Pixel Quilt
        </h1>

        <div style={{
          overflow: 'auto',
          width: '100%',
          maxHeight: 'calc(100vh - 150px)'
        }}>
          <QuiltGrid
            squares={squares}
            onSquareClick={(index) => setEditingSquare(index)}
            onPatternCopy={copySquarePattern}
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
      </div>
    </div>
  )
}

export default App
