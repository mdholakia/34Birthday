import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { listSnapshots, restoreSnapshot, formatBytes } from '../src/utils/snapshotManager.js'
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
  console.log('🔷 Pixel Quilt Snapshot Restore\n')

  try {
    // Initialize Firebase
    console.log('🔌 Connecting to Firebase...')
    const app = initializeApp(firebaseConfig)
    const db = getDatabase(app)
    console.log('✓ Connected to Firebase\n')

    // List available snapshots
    console.log('📋 Fetching available snapshots...')
    const listResult = await listSnapshots(db)

    if (!listResult.success) {
      console.error('❌ Failed to fetch snapshots:', listResult.error)
      process.exit(1)
    }

    if (listResult.snapshots.length === 0) {
      console.log('⚠️  No snapshots found.')
      console.log('   Create a snapshot first using: npm run snapshot:create')
      rl.close()
      process.exit(0)
    }

    console.log(`✓ Found ${listResult.snapshots.length} snapshot(s)\n`)
    console.log('Available snapshots:')
    listResult.snapshots.forEach((snapshot, index) => {
      console.log(`\n${index + 1}. ${snapshot.label}`)
      console.log(`   Date: ${snapshot.date.toLocaleString()}`)
      console.log(`   Timestamp: ${snapshot.timestamp}`)
      console.log(`   Squares: ${snapshot.squareCount}`)
      console.log(`   Size: ${formatBytes(snapshot.size)}`)
      console.log(`   Hash: ${snapshot.hash}`)
    })

    console.log('\n' + '─'.repeat(60))

    // Ask which snapshot to restore
    const answer = await question('\nEnter number to restore (or "cancel" to exit): ')

    if (answer.toLowerCase() === 'cancel' || answer === '') {
      console.log('Cancelled.')
      rl.close()
      process.exit(0)
    }

    const index = parseInt(answer) - 1

    if (isNaN(index) || index < 0 || index >= listResult.snapshots.length) {
      console.error('❌ Invalid selection')
      rl.close()
      process.exit(1)
    }

    const selectedSnapshot = listResult.snapshots[index]

    // Confirm restoration
    console.log(`\n⚠️  WARNING: This will OVERWRITE current squares data!`)
    console.log(`   You are about to restore:`)
    console.log(`   - ${selectedSnapshot.label}`)
    console.log(`   - ${selectedSnapshot.squareCount} squares`)
    console.log(`   - From ${selectedSnapshot.date.toLocaleString()}`)

    const confirm = await question('\nType "RESTORE" to confirm: ')

    if (confirm !== 'RESTORE') {
      console.log('Cancelled.')
      rl.close()
      process.exit(0)
    }

    console.log('\n♻️  Restoring snapshot...')

    // Restore snapshot
    const restoreResult = await restoreSnapshot(db, selectedSnapshot.timestamp)

    if (!restoreResult.success) {
      console.error('❌ Failed to restore snapshot:', restoreResult.error)
      process.exit(1)
    }

    console.log('✓ Snapshot restored successfully!\n')
    console.log('📋 Restore Details:')
    console.log(`   Squares restored: ${restoreResult.squareCount}`)
    console.log(`   Data hash: ${restoreResult.hash}`)
    console.log('\n✅ Firebase data has been restored!')
    console.log('   Refresh your browser to see the changes.')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    rl.close()
    process.exit(1)
  }
}

main()
