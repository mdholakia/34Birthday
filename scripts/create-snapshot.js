import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { createSnapshot, formatBytes } from '../src/utils/snapshotManager.js'
import * as readline from 'readline'

// Firebase config (same as in src/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyAFcTv8rOTz111kH7T73wUlEXDeuZ2BB5U",
  authDomain: "birthday-34-website.firebaseapp.com",
  databaseURL: "https://birthday-34-website-default-rtdb.firebaseio.com",
  projectId: "birthday-34-website",
  storageBucket: "birthday-34-website.firebasestorage.app",
  messagingSenderId: "44575399938",
  appId: "1:44575399938:web:4e03571cda6a11608f871b"
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('🔷 Pixel Quilt Snapshot Creator\n')

  try {
    // Initialize Firebase
    console.log('🔌 Connecting to Firebase...')
    const app = initializeApp(firebaseConfig)
    const db = getDatabase(app)
    console.log('✓ Connected to Firebase\n')

    // Ask for optional label
    const label = await question('Enter snapshot label (or press Enter for default): ')

    console.log('\n📸 Creating snapshot...')

    // Create snapshot
    const result = await createSnapshot(db, label.trim())

    if (!result.success) {
      console.error('❌ Failed to create snapshot:', result.error)
      process.exit(1)
    }

    console.log('✓ Snapshot created successfully!\n')
    console.log('📋 Snapshot Details:')
    console.log(`   Timestamp: ${result.timestamp}`)
    console.log(`   Date: ${new Date(result.timestamp).toLocaleString()}`)
    console.log(`   Hash: ${result.hash}`)
    console.log(`   Size: ${formatBytes(result.size)}`)
    console.log(`   Squares: ${result.squareCount}`)
    console.log(`   Label: ${label.trim() || `Snapshot ${new Date(result.timestamp).toLocaleString()}`}`)
    console.log(`\n   Firebase path: snapshots/manual/${result.timestamp}`)
    console.log('\n✅ Snapshot saved successfully!')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    rl.close()
    process.exit(1)
  }
}

main()
