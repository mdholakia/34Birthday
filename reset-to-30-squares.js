// Script to reset Firebase to 30 squares (5 columns × 6 rows)
import { ref, set } from 'firebase/database'
import { db } from './src/firebase.js'

const resetSquares = async () => {
  // Create 30 blank squares (5 columns × 6 rows)
  const newSquares = Array(30).fill(null).map(() =>
    Array(16).fill(null).map(() => Array(16).fill('#F5EFEE'))
  )

  try {
    await set(ref(db, 'squares'), newSquares)
    console.log('✅ Successfully reset to 30 squares (5×6 grid)')
    console.log('Refresh your browser to see the new grid!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting squares:', error)
    process.exit(1)
  }
}

resetSquares()
