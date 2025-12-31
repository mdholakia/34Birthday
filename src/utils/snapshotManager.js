import { ref, get, set, push } from 'firebase/database'
import crypto from 'crypto'

/**
 * Generate a hash of the squares data to detect changes
 */
export function hashData(data) {
  const jsonString = JSON.stringify(data)
  return crypto.createHash('sha256').update(jsonString).digest('hex').substring(0, 16)
}

/**
 * Calculate the size of data in bytes
 */
export function calculateSize(data) {
  const jsonString = JSON.stringify(data)
  return new TextEncoder().encode(jsonString).length
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Create a snapshot of the current squares data
 */
export async function createSnapshot(db, label = '') {
  try {
    // Read current squares data
    const squaresRef = ref(db, 'squares')
    const snapshot = await get(squaresRef)

    if (!snapshot.exists()) {
      throw new Error('No squares data found in Firebase')
    }

    const squaresData = snapshot.val()
    const timestamp = Date.now()
    const dataHash = hashData(squaresData)
    const size = calculateSize(squaresData)

    // Create snapshot object
    const snapshotData = {
      data: squaresData,
      timestamp,
      hash: dataHash,
      label: label || `Snapshot ${new Date(timestamp).toLocaleString()}`,
      squareCount: Array.isArray(squaresData) ? squaresData.length : 0,
      size
    }

    // Save to Firebase under snapshots/manual
    const snapshotsRef = ref(db, `snapshots/manual/${timestamp}`)
    await set(snapshotsRef, snapshotData)

    return {
      success: true,
      timestamp,
      hash: dataHash,
      size,
      squareCount: snapshotData.squareCount
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * List all available snapshots
 */
export async function listSnapshots(db) {
  try {
    const snapshotsRef = ref(db, 'snapshots/manual')
    const snapshot = await get(snapshotsRef)

    if (!snapshot.exists()) {
      return {
        success: true,
        snapshots: []
      }
    }

    const snapshotsData = snapshot.val()
    const snapshots = Object.entries(snapshotsData).map(([timestamp, data]) => ({
      timestamp: parseInt(timestamp),
      date: new Date(parseInt(timestamp)),
      label: data.label || 'Unlabeled',
      hash: data.hash,
      size: data.size,
      squareCount: data.squareCount || 0
    }))

    // Sort by timestamp descending (newest first)
    snapshots.sort((a, b) => b.timestamp - a.timestamp)

    return {
      success: true,
      snapshots
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      snapshots: []
    }
  }
}

/**
 * Restore from a snapshot
 */
export async function restoreSnapshot(db, timestamp) {
  try {
    // Get the snapshot data
    const snapshotRef = ref(db, `snapshots/manual/${timestamp}`)
    const snapshot = await get(snapshotRef)

    if (!snapshot.exists()) {
      throw new Error(`Snapshot ${timestamp} not found`)
    }

    const snapshotData = snapshot.val()

    if (!snapshotData.data) {
      throw new Error('Snapshot does not contain data')
    }

    // Restore to squares
    const squaresRef = ref(db, 'squares')
    await set(squaresRef, snapshotData.data)

    return {
      success: true,
      timestamp,
      squareCount: Array.isArray(snapshotData.data) ? snapshotData.data.length : 0,
      hash: snapshotData.hash
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validate snapshot data structure
 */
export function validateSnapshotData(data) {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'Data is not an array' }
  }

  for (let i = 0; i < data.length; i++) {
    const square = data[i]

    if (!Array.isArray(square)) {
      return { valid: false, error: `Square ${i} is not an array` }
    }

    if (square.length !== 15) {
      return { valid: false, error: `Square ${i} has ${square.length} rows, expected 15` }
    }

    for (let row = 0; row < square.length; row++) {
      if (!Array.isArray(square[row])) {
        return { valid: false, error: `Square ${i}, row ${row} is not an array` }
      }

      if (square[row].length !== 15) {
        return { valid: false, error: `Square ${i}, row ${row} has ${square[row].length} columns, expected 15` }
      }
    }
  }

  return { valid: true }
}
