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

// Initialize all 36 squares with white/beige (#F5EFEE)
const squares = Array(36).fill(null).map(() =>
  Array(16).fill(null).map(() => Array(16).fill('#F5EFEE'))
)

// Reset the database
set(ref(db, 'squares'), squares)
  .then(() => {
    console.log('✅ Firebase data has been reset successfully!')
    console.log('All 36 squares are now initialized with white/beige (#F5EFEE)')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error resetting Firebase data:', error)
    process.exit(1)
  })
