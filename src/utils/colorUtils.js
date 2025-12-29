/**
 * Color normalization utilities for consistent color comparison
 */

/**
 * Normalize color strings to uppercase hex format for comparison
 * Handles both hex (#RRGGBB) and rgb(r, g, b) formats
 * @param {string} color - Color in hex or rgb() format
 * @returns {string} - Normalized uppercase hex color (#RRGGBB)
 */
export function normalizeColor(color) {
  if (!color) return '#000000'

  // Already hex format - just uppercase it
  if (color.startsWith('#')) {
    return color.toUpperCase()
  }

  // Convert rgb(r, g, b) to #RRGGBB
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`.toUpperCase()
  }

  // Fallback - return as-is uppercased
  return color.toUpperCase()
}
