/**
 * @typedef {'empty' | 'filled' | 'marked' | 'wrong'} CellState
 * @typedef {'easy' | 'medium' | 'hard'} Difficulty
 * @typedef {'fill' | 'mark'} Tool
 */

/**
 * @typedef {Object} Level
 * @property {number} id
 * @property {Difficulty} difficulty
 * @property {number} size
 * @property {number[][]} solution - 0 = empty, 1 = filled
 * @property {string} name
 * @property {string} [description]
 */
