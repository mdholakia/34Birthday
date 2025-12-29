/**
 * Pixel matching utility for detecting when a painted pixel matches its neighbor
 */

import { normalizeColor } from './colorUtils'

/**
 * Check if a specific pixel matches its corresponding neighbor pixel
 * Only checks if the pixel is on an edge and has a neighbor
 * @param {number} row - Row index of the painted pixel
 * @param {number} col - Column index of the painted pixel
 * @param {Array<Array<string>>} currentPixels - Current square's 16x16 pixel grid
 * @param {Array<Array<Array<string>>>} allSquares - All quilt squares
 * @param {Object} adjacentSquares - Neighbor indices {top, right, bottom, left, ...}
 * @returns {Object} - {isMatch: boolean, edge: 'top'|'right'|'bottom'|'left'|null}
 */
export function checkPixelMatch(row, col, currentPixels, allSquares, adjacentSquares) {
  const GRID_SIZE = 16

  const currentColor = normalizeColor(currentPixels[row][col])

  // Check top edge (row === 0)
  if (row === 0 && adjacentSquares.top !== null) {
    const neighborSquare = allSquares[adjacentSquares.top]
    if (neighborSquare) {
      const neighborColor = normalizeColor(neighborSquare[GRID_SIZE - 1][col])
      if (currentColor === neighborColor) {
        return { isMatch: true, edge: 'top' }
      }
    }
  }

  // Check right edge (col === 15)
  if (col === GRID_SIZE - 1 && adjacentSquares.right !== null) {
    const neighborSquare = allSquares[adjacentSquares.right]
    if (neighborSquare) {
      const neighborColor = normalizeColor(neighborSquare[row][0])
      if (currentColor === neighborColor) {
        return { isMatch: true, edge: 'right' }
      }
    }
  }

  // Check bottom edge (row === 15)
  if (row === GRID_SIZE - 1 && adjacentSquares.bottom !== null) {
    const neighborSquare = allSquares[adjacentSquares.bottom]
    if (neighborSquare) {
      const neighborColor = normalizeColor(neighborSquare[0][col])
      if (currentColor === neighborColor) {
        return { isMatch: true, edge: 'bottom' }
      }
    }
  }

  // Check left edge (col === 0)
  if (col === 0 && adjacentSquares.left !== null) {
    const neighborSquare = allSquares[adjacentSquares.left]
    if (neighborSquare) {
      const neighborColor = normalizeColor(neighborSquare[row][GRID_SIZE - 1])
      if (currentColor === neighborColor) {
        return { isMatch: true, edge: 'left' }
      }
    }
  }

  // Not on an edge, or no match
  return { isMatch: false, edge: null }
}
