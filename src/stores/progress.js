import { defineStore } from 'pinia'

const STORAGE_KEYS = {
  completed: 'picross-completed',
  times: 'picross-times',
  stars: 'picross-stars',
}

function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function toKey(worldId, levelId) {
  return `${worldId}-${levelId}`
}

function migrateOldFormat(completed, times, stars) {
  const newCompleted = new Set()
  const newTimes = {}
  const newStars = {}

  completed.forEach((id) => {
    const key = typeof id === 'number' ? toKey(1, id) : id
    newCompleted.add(key)
  })

  Object.entries(times).forEach(([id, val]) => {
    const key = /^\d+$/.test(id) ? toKey(1, Number(id)) : id
    newTimes[key] = val
  })

  Object.entries(stars).forEach(([id, val]) => {
    const key = /^\d+$/.test(id) ? toKey(1, Number(id)) : id
    newStars[key] = val
  })

  return { newCompleted, newTimes, newStars }
}

export const useProgressStore = defineStore('progress', {
  state: () => {
    const completed = loadFromStorage(STORAGE_KEYS.completed, [])
    const times = loadFromStorage(STORAGE_KEYS.times, {})
    const stars = loadFromStorage(STORAGE_KEYS.stars, {})

    const isOldFormat = completed.length > 0 && typeof completed[0] === 'number'
    const { newCompleted, newTimes, newStars } = isOldFormat
      ? migrateOldFormat(completed, times, stars)
      : {
          newCompleted: new Set(completed),
          newTimes: times,
          newStars: stars,
        }

    if (isOldFormat) {
      saveToStorage(STORAGE_KEYS.completed, [...newCompleted])
      saveToStorage(STORAGE_KEYS.times, newTimes)
      saveToStorage(STORAGE_KEYS.stars, newStars)
    }

    return {
      completedLevels: newCompleted,
      levelTimes: newTimes,
      levelStars: newStars,
    }
  },

  getters: {
    isCompleted: (state) => (worldId, levelId) =>
      state.completedLevels.has(toKey(worldId, levelId)),
    getTime: (state) => (worldId, levelId) =>
      state.levelTimes[toKey(worldId, levelId)],
    getStars: (state) => (worldId, levelId) =>
      state.levelStars[toKey(worldId, levelId)] ?? 0,
    totalCompleted: (state) => state.completedLevels.size,
    completedInWorld: (state) => (worldId) => {
      let count = 0
      state.completedLevels.forEach((key) => {
        if (key.startsWith(`${worldId}-`)) count++
      })
      return count
    },
  },

  actions: {
    loadFromLocalStorage() {
      const completed = loadFromStorage(STORAGE_KEYS.completed, [])
      const times = loadFromStorage(STORAGE_KEYS.times, {})
      const stars = loadFromStorage(STORAGE_KEYS.stars, {})

      const isOldFormat = completed.length > 0 && typeof completed[0] === 'number'
      if (isOldFormat) {
        const { newCompleted, newTimes, newStars } = migrateOldFormat(
          completed,
          times,
          stars
        )
        this.completedLevels = newCompleted
        this.levelTimes = newTimes
        this.levelStars = newStars
      } else {
        this.completedLevels = new Set(completed)
        this.levelTimes = times
        this.levelStars = stars
      }
    },

    completeLevel(worldId, levelId, time, stars) {
      const key = toKey(worldId, levelId)
      this.completedLevels.add(key)
      this.levelTimes[key] = time
      this.levelStars[key] = Math.max(this.levelStars[key] ?? 0, stars)
      this.persist()
    },

    persist() {
      saveToStorage(STORAGE_KEYS.completed, [...this.completedLevels])
      saveToStorage(STORAGE_KEYS.times, this.levelTimes)
      saveToStorage(STORAGE_KEYS.stars, this.levelStars)
    },
  },
})
