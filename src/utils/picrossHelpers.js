/**
 * @param {import('../types/picross').CellState[][]} grid
 * @param {number} rowIdx
 * @param {number[][]} solution
 * @returns {boolean}
 */
export function isRowComplete(grid, rowIdx, solution) {
  for (let c = 0; c < grid[rowIdx].length; c++) {
    const shouldBeFilled = solution[rowIdx][c] === 1
    const isFilled = grid[rowIdx][c] === 'filled'
    if (shouldBeFilled !== isFilled) return false
  }
  return true
}

/**
 * @param {import('../types/picross').CellState[][]} grid
 * @param {number} colIdx
 * @param {number[][]} solution
 * @returns {boolean}
 */
export function isColComplete(grid, colIdx, solution) {
  for (let r = 0; r < grid.length; r++) {
    const shouldBeFilled = solution[r][colIdx] === 1
    const isFilled = grid[r][colIdx] === 'filled'
    if (shouldBeFilled !== isFilled) return false
  }
  return true
}

/**
 * @param {import('../types/picross').CellState[][]} grid
 * @param {number[][]} solution
 * @returns {Set<number>}
 */
export function getCompletedRows(grid, solution) {
  const completed = new Set()
  for (let r = 0; r < grid.length; r++) {
    if (isRowComplete(grid, r, solution)) completed.add(r)
  }
  return completed
}

/**
 * @param {import('../types/picross').CellState[][]} grid
 * @param {number[][]} solution
 * @returns {Set<number>}
 */
export function getCompletedCols(grid, solution) {
  const completed = new Set()
  for (let c = 0; c < grid[0].length; c++) {
    if (isColComplete(grid, c, solution)) completed.add(c)
  }
  return completed
}

/**
 * @param {number[][]} solution
 * @returns {{ rows: number[][], cols: number[][] }}
 */
export function generateClues(solution) {
  const size = solution.length
  const rows = []
  const cols = []

  for (let r = 0; r < size; r++) {
    const clue = []
    let count = 0
    for (let c = 0; c < size; c++) {
      if (solution[r][c] === 1) count++
      else {
        if (count > 0) { clue.push(count); count = 0 }
      }
    }
    if (count > 0) clue.push(count)
    rows.push(clue.length > 0 ? clue : [0])
  }

  for (let c = 0; c < size; c++) {
    const clue = []
    let count = 0
    for (let r = 0; r < size; r++) {
      if (solution[r][c] === 1) count++
      else {
        if (count > 0) { clue.push(count); count = 0 }
      }
    }
    if (count > 0) clue.push(count)
    cols.push(clue.length > 0 ? clue : [0])
  }

  return { rows, cols }
}

const PENALTY_SEC = 10

/** Effective time = real time + (hintsUsed + wrongClicks) * 10 sec */
export function getEffectiveTime(realTimeSec, hintsUsed, wrongClicks = 0) {
  return realTimeSec + (hintsUsed + wrongClicks) * PENALTY_SEC
}

/**
 * Star thresholds by grid size (effective time in seconds):
 * - 3 stars: fast
 * - 2 stars: medium
 * - 1 star: completed
 */
const STAR_THRESHOLDS = {
  5: { three: 45, two: 120 },
  10: { three: 150, two: 360 },
  15: { three: 420, two: 720 },
}

/**
 * @param {number} effectiveTimeSec
 * @param {number} levelSize
 * @returns {1|2|3}
 */
export function getStars(effectiveTimeSec, levelSize) {
  const thresholds = STAR_THRESHOLDS[levelSize] ?? STAR_THRESHOLDS[15]
  if (effectiveTimeSec <= thresholds.three) return 3
  if (effectiveTimeSec <= thresholds.two) return 2
  return 1
}
