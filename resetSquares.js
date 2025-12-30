import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAFcTv8rOTz111kH7T73wUlEXDeuZ2BB5U",
  authDomain: "birthday-34-website.firebaseapp.com",
  databaseURL: "https://birthday-34-website-default-rtdb.firebaseio.com",
  projectId: "birthday-34-website",
  storageBucket: "birthday-34-website.firebasestorage.app",
  messagingSenderId: "44575399938",
  appId: "1:44575399938:web:4e03571cda6a11608f871b"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// Create 30 squares, each 15x15, filled with default color
const defaultSquares = Array(30).fill(null).map(() =>
  Array(15).fill(null).map(() => Array(15).fill('#F5EFEE'))
)

console.log('Resetting all squares to default blank color...')
set(ref(db, 'squares'), defaultSquares)
  .then(() => {
    console.log('✓ Successfully reset all squares!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error resetting squares:', error)
    process.exit(1)
  })
