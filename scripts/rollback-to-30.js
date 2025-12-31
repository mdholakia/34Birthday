import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set } from 'firebase/database'
import { hashData, formatBytes, calculateSize } from '../src/utils/snapshotManager.js'
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
  console.log('🔷 Pixel Quilt Grid Rollback\n')
  console.log('This will truncate the grid back to 30 squares (5×6 layout)\n')

  try {
    // Initialize Firebase
    console.log('🔌 Connecting to Firebase...')
    const app = initializeApp(firebaseConfig)
    const db = getDatabase(app)
    console.log('✓ Connected to Firebase\n')

    // Read current data
    console.log('🔍 Reading current Firebase data...')
    const squaresRef = ref(db, 'squares')
    const snapshot = await get(squaresRef)

    if (!snapshot.exists()) {
      console.error('❌ No squares data found in Firebase')
      process.exit(1)
    }

    const currentSquares = snapshot.val()
    console.log(`✓ Found ${currentSquares.length} squares\n`)

    if (currentSquares.length <= 30) {
      console.log(`⚠️  Grid already has ${currentSquares.length} squares (≤30)`)
      console.log('   No rollback needed.')
      rl.close()
      process.exit(0)
    }

    // Create truncated array
    const truncatedSquares = currentSquares.slice(0, 30)

    // Calculate details
    const currentHash = hashData(currentSquares)
    const truncatedHash = hashData(truncatedSquares)
    const squaresToRemove = currentSquares.length - 30

    // Show rollback plan
    console.log('📋 Rollback Plan:')
    console.log('─'.repeat(60))
    console.log(`   Current squares: ${currentSquares.length}`)
    console.log(`   Squares to remove: ${squaresToRemove}`)
    console.log(`   Squares after rollback: ${truncatedSquares.length}`)
    console.log(`\n   ⚠️  WILL BE DELETED:`)
    console.log(`   - Squares 30-${currentSquares.length - 1} (${squaresToRemove} squares)`)
    console.log(`\n   ✓ WILL BE KEPT:`)
    console.log(`   - Squares 0-29 (30 squares)`)
    console.log(`\n   Size:`)
    console.log(`   - Current: ${formatBytes(calculateSize(currentSquares))}`)
    console.log(`   - After rollback: ${formatBytes(calculateSize(truncatedSquares))}`)
    console.log('─'.repeat(60))

    // Show preview of squares that will be deleted
    console.log('\n⚠️  Squares that will be PERMANENTLY DELETED:')
    for (let i = 30; i < Math.min(33, currentSquares.length); i++) {
      const square = currentSquares[i]
      const isBlank = square.every(row => row.every(pixel => pixel === '#F5EFEE'))
      console.log(`   Square ${i}: ${isBlank ? 'Blank' : 'HAS CUSTOM DESIGN ⚠️'}`)
    }

    if (squaresToRemove > 3) {
      console.log(`   ... and ${squaresToRemove - 3} more squares`)
    }

    // Check if any custom designs will be lost
    let customDesigns = 0
    for (let i = 30; i < currentSquares.length; i++) {
      const square = currentSquares[i]
      const isBlank = square.every(row => row.every(pixel => pixel === '#F5EFEE'))
      if (!isBlank) {
        customDesigns++
      }
    }

    if (customDesigns > 0) {
      console.log(`\n⚠️⚠️⚠️  WARNING: ${customDesigns} square(s) have CUSTOM DESIGNS!`)
      console.log('   These designs will be PERMANENTLY LOST!')
      console.log('   Consider creating a snapshot backup first.')
    }

    // Confirmation
    console.log('\n⚠️  DANGER: This will DELETE data from Firebase!')
    console.log('   This action cannot be undone (unless you have a snapshot backup).\n')

    const confirm = await question('Type "ROLLBACK" to confirm and proceed: ')

    if (confirm !== 'ROLLBACK') {
      console.log('Cancelled.')
      rl.close()
      process.exit(0)
    }

    console.log('\n🚀 Starting rollback...')

    // Write to Firebase
    await set(squaresRef, truncatedSquares)

    console.log('✓ Data written to Firebase\n')

    // Validate written data
    console.log('🔍 Validating written data...')
    const verifySnapshot = await get(squaresRef)
    const verifiedData = verifySnapshot.val()

    console.log(`✓ Verified ${verifiedData.length} squares in Firebase`)

    if (verifiedData.length !== 30) {
      console.error(`\n❌ ERROR: Expected 30 squares, got ${verifiedData.length}`)
      process.exit(1)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Rollback completed successfully!')
    console.log('='.repeat(60))
    console.log(`\n📊 Summary:`)
    console.log(`   - Squares removed: ${squaresToRemove}`)
    console.log(`   - Squares remaining: ${verifiedData.length}`)
    console.log(`   - Grid layout: 5 columns × 6 rows`)
    console.log('\n👉 Next steps:')
    console.log('   1. Update code back to Array(30), repeat(5, 1fr), etc.')
    console.log('   2. Refresh your browser')
    console.log('   3. Verify the grid shows 30 squares')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message)
    console.error('\n🔄 Recovery option:')
    console.error('   Run: npm run snapshot:restore')
    rl.close()
    process.exit(1)
  }
}

main()
