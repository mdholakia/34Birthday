import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set } from 'firebase/database'
import { hashData, formatBytes, calculateSize, validateSnapshotData } from '../src/utils/snapshotManager.js'
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
  console.log('🔷 Pixel Quilt Grid Expansion Migration\n')
  console.log('This will expand the grid from 30 to 48 squares (6×8 layout)\n')

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

    // Validate current data structure
    console.log('🔍 Validating current data structure...')
    const validation = validateSnapshotData(currentSquares)

    if (!validation.valid) {
      console.error('❌ Data validation failed:', validation.error)
      process.exit(1)
    }

    console.log('✓ Data structure is valid\n')

    // Check if already migrated
    if (currentSquares.length >= 48) {
      console.log(`⚠️  Grid already has ${currentSquares.length} squares (≥48)`)
      const confirm = await question('Do you want to continue anyway? (yes/no): ')

      if (confirm.toLowerCase() !== 'yes') {
        console.log('Cancelled.')
        rl.close()
        process.exit(0)
      }
    }

    // Create new blank squares
    const blankSquare = Array(15).fill(null).map(() => Array(15).fill('#F5EFEE'))
    const squaresToAdd = 48 - currentSquares.length

    if (squaresToAdd <= 0) {
      console.log('❌ No squares to add (current count is already 48 or more)')
      rl.close()
      process.exit(0)
    }

    // Build expanded array
    const expandedSquares = [
      ...currentSquares,
      ...Array(squaresToAdd).fill(null).map(() =>
        JSON.parse(JSON.stringify(blankSquare)) // Deep copy
      )
    ]

    // Calculate hashes
    const currentHash = hashData(currentSquares)
    const preservedHash = hashData(expandedSquares.slice(0, currentSquares.length))

    // Show migration plan
    console.log('📋 Migration Plan:')
    console.log('─'.repeat(60))
    console.log(`   Current squares: ${currentSquares.length}`)
    console.log(`   New squares to add: ${squaresToAdd}`)
    console.log(`   Total after migration: ${expandedSquares.length}`)
    console.log(`\n   Preservation:`)
    console.log(`   - Squares 0-${currentSquares.length - 1}: PRESERVED (unchanged)`)
    console.log(`   - Squares ${currentSquares.length}-47: NEW BLANK SQUARES`)
    console.log(`\n   Data integrity:`)
    console.log(`   - Current data hash: ${currentHash}`)
    console.log(`   - Preserved data hash: ${preservedHash}`)
    console.log(`   - Hashes match: ${currentHash === preservedHash ? '✓ YES' : '❌ NO'}`)
    console.log(`\n   Size:`)
    console.log(`   - Current: ${formatBytes(calculateSize(currentSquares))}`)
    console.log(`   - After migration: ${formatBytes(calculateSize(expandedSquares))}`)
    console.log('─'.repeat(60))

    if (currentHash !== preservedHash) {
      console.error('\n❌ ERROR: Preserved data hash does not match!')
      console.error('   This indicates data corruption. Aborting.')
      process.exit(1)
    }

    // Preview some new squares
    console.log('\n📋 Preview of new squares:')
    for (let i = currentSquares.length; i < Math.min(currentSquares.length + 3, expandedSquares.length); i++) {
      console.log(`   Square ${i}: 15×15 grid, all #F5EFEE`)
    }

    if (squaresToAdd > 3) {
      console.log(`   ... and ${squaresToAdd - 3} more blank squares`)
    }

    // Confirmation
    console.log('\n⚠️  WARNING: This will modify production Firebase data!')
    console.log('   Make sure you have created a snapshot backup first.')
    console.log('   (Run: npm run snapshot:create)\n')

    const confirm = await question('Type "MIGRATE" to confirm and proceed: ')

    if (confirm !== 'MIGRATE') {
      console.log('Cancelled.')
      rl.close()
      process.exit(0)
    }

    console.log('\n🚀 Starting migration...')

    // Write to Firebase
    await set(squaresRef, expandedSquares)

    console.log('✓ Data written to Firebase\n')

    // Validate written data
    console.log('🔍 Validating written data...')
    const verifySnapshot = await get(squaresRef)
    const verifiedData = verifySnapshot.val()

    console.log(`✓ Verified ${verifiedData.length} squares in Firebase`)

    // Final checks
    const verifiedPreservedHash = hashData(verifiedData.slice(0, currentSquares.length))
    console.log(`✓ Preserved data hash: ${verifiedPreservedHash}`)
    console.log(`✓ Hash matches original: ${verifiedPreservedHash === currentHash ? 'YES' : 'NO'}`)

    if (verifiedPreservedHash !== currentHash) {
      console.error('\n❌ ERROR: Data verification failed!')
      console.error('   Preserved data hash does not match original.')
      console.error('   You may need to restore from snapshot.')
      process.exit(1)
    }

    // Check new squares
    console.log('\n🔍 Checking new squares...')
    let allBlank = true
    for (let i = currentSquares.length; i < verifiedData.length; i++) {
      const square = verifiedData[i]
      const isBlank = square.every(row => row.every(pixel => pixel === '#F5EFEE'))
      if (!isBlank) {
        allBlank = false
        console.log(`   ⚠️  Square ${i} is not blank`)
      }
    }

    if (allBlank) {
      console.log(`✓ All ${squaresToAdd} new squares are blank (#F5EFEE)`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Migration completed successfully! 🎉')
    console.log('='.repeat(60))
    console.log(`\n📊 Summary:`)
    console.log(`   - Original squares (0-${currentSquares.length - 1}): Preserved ✓`)
    console.log(`   - New squares (${currentSquares.length}-47): Created ✓`)
    console.log(`   - Total squares: ${verifiedData.length}`)
    console.log(`   - Grid layout: 6 columns × 8 rows`)
    console.log('\n👉 Next steps:')
    console.log('   1. Refresh your browser to see the expanded grid')
    console.log('   2. Test editing a new square (e.g., square 35)')
    console.log('   3. Verify mobile layout looks good')
    console.log('   4. Create a post-migration snapshot for safety')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n🔄 Rollback options:')
    console.error('   1. Run: npm run snapshot:restore')
    console.error('   2. Or run: npm run migrate:rollback')
    rl.close()
    process.exit(1)
  }
}

main()
