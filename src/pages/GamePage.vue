<template>
  <div class="game">
    <div class="game__content">
      <div
        class="game__grid-wrapper"
        @mouseleave="hoveredRow = null; hoveredCol = null"
      >
        <GameGrid
          :grid="grid"
          :row-clues="rowClues"
          :col-clues="colClues"
          :hovered-row="hoveredRow"
          :hovered-col="hoveredCol"
          :selected-row="selectedRow"
          :selected-col="selectedCol"
          :selection-visible="selectionVisible"
          :completed-rows="completedRows"
          :completed-cols="completedCols"
          @cell-click="handleCellClickWithSelect"
          @cell-right-click="handleCellRightClickWithSelect"
        />
      </div>

      <div class="game__toolbar">
        <Toolbar
          :current-tool="currentTool"
          :can-undo="history.length > 0"
          @tool-change="currentTool = $event"
          @undo="handleUndo"
          @hint="handleHint"
          @reset="openConfirmModal('reset')"
          @home="openConfirmModal('home')"
        />
      </div>
    </div>

    <VictoryModal
      :open="showVictory"
      :time="displayTime"
      :stars="victoryStars"
      :solution="level?.solution ?? []"
      :has-next="hasNextLevel"
      @close="showVictory = false"
      @next="handleNext"
      @retry="handleRetry"
      @home="router.push(`/world/${worldId}/levels`)"
    />

    <ConfirmModal
      :open="confirmType !== null"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :confirm-text="confirmConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @cancel="confirmType = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progress'
import { useGameUIStore } from '../stores/gameUI'
import GameGrid from '../components/GameGrid/GameGrid.vue'
import Toolbar from '../components/Toolbar/Toolbar.vue'
import VictoryModal from '../components/VictoryModal/VictoryModal.vue'
import ConfirmModal from '../components/ConfirmModal/ConfirmModal.vue'
import { generateClues } from '../utils/picrossHelpers'
import { getLevelsByWorld } from '../data/worlds'
import { getCompletedRows, getCompletedCols, getEffectiveTime, getStars } from '../utils/picrossHelpers'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()
const gameUI = useGameUIStore()

const worldId = computed(() => Number(route.params.worldId))
const levels = computed(() => getLevelsByWorld(worldId.value) ?? [])
const level = computed(() =>
  levels.value.find((l) => l.id === Number(route.params.levelId))
)

// Redirect if level not found
watch(
  level,
  (l) => {
    if (!l) router.replace(`/world/${worldId.value}/levels`)
  },
  { immediate: true }
)

const rowClues = computed(() =>
  level.value ? generateClues(level.value.solution).rows : []
)
const colClues = computed(() =>
  level.value ? generateClues(level.value.solution).cols : []
)

const grid = ref([])
const currentTool = ref('fill')
const moves = ref(0)
const time = ref(0)
const startTime = ref(Date.now())
const showVictory = ref(false)
const history = ref([])
const hintsUsed = ref(0)
const wrongClicks = ref(0)
const showPenaltyFlash = ref(false)
const confirmType = ref(null) // 'reset' | 'home' | null
const hoveredRow = ref(null)

const CONFIRM_CONFIGS = {
  reset: {
    title: 'Сбросить уровень?',
    message: 'Весь прогресс будет потерян. Вы уверены?',
    confirmText: 'Сбросить',
  },
  home: {
    title: 'Выйти в меню?',
    message: 'Прогресс не сохранится. Вы уверены?',
    confirmText: 'Выйти',
  },
}

const confirmConfig = computed(() =>
  confirmType.value ? CONFIRM_CONFIGS[confirmType.value] : CONFIRM_CONFIGS.reset
)

function openConfirmModal(type) {
  confirmType.value = type
}

function onConfirmModalConfirm() {
  if (confirmType.value === 'reset') {
    doReset()
  } else if (confirmType.value === 'home') {
    router.push(`/world/${worldId}/levels`)
  }
  confirmType.value = null
}
const hoveredCol = ref(null)
const selectedRow = ref(0)
const selectedCol = ref(0)
const selectionVisible = ref(false)
const isKeyboardPainting = ref(false)
const keyboardPaintUseMark = ref(false)

function initGrid() {
  if (!level.value) return
  grid.value = Array(level.value.size)
    .fill(null)
    .map(() => Array(level.value.size).fill('empty'))
}

watch(
  () => route.params.levelId,
  () => {
    if (!level.value) return
    initGrid()
    moves.value = 0
    time.value = 0
    startTime.value = Date.now()
    showVictory.value = false
    history.value = []
    hintsUsed.value = 0
    wrongClicks.value = 0
    showPenaltyFlash.value = false
    currentTool.value = 'fill'
    selectedRow.value = 0
    selectedCol.value = 0
    selectionVisible.value = false
  },
  { immediate: true }
)

// Timer — останавливается при победе
watch(
  [showVictory, startTime],
  ([victory]) => {
    if (victory) return
    const interval = setInterval(() => {
      if (showVictory.value) return
      time.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
    return () => clearInterval(interval)
  },
  { immediate: true }
)

// Keyboard shortcuts
function handleKeyPress(e) {
  if (showVictory.value || confirmType.value) return
  const size = level.value?.size ?? 0

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      if (size > 0) {
        selectionVisible.value = true
        selectedRow.value = Math.max(0, selectedRow.value - 1)
        if (isKeyboardPainting.value) {
          applyToCell(selectedRow.value, selectedCol.value, false, keyboardPaintUseMark.value)
        }
      }
      return
    case 'ArrowDown':
      e.preventDefault()
      if (size > 0) {
        selectionVisible.value = true
        selectedRow.value = Math.min(size - 1, selectedRow.value + 1)
        if (isKeyboardPainting.value) {
          applyToCell(selectedRow.value, selectedCol.value, false, keyboardPaintUseMark.value)
        }
      }
      return
    case 'ArrowLeft':
      e.preventDefault()
      if (size > 0) {
        selectionVisible.value = true
        selectedCol.value = Math.max(0, selectedCol.value - 1)
        if (isKeyboardPainting.value) {
          applyToCell(selectedRow.value, selectedCol.value, false, keyboardPaintUseMark.value)
        }
      }
      return
    case 'ArrowRight':
      e.preventDefault()
      if (size > 0) {
        selectionVisible.value = true
        selectedCol.value = Math.min(size - 1, selectedCol.value + 1)
        if (isKeyboardPainting.value) {
          applyToCell(selectedRow.value, selectedCol.value, false, keyboardPaintUseMark.value)
        }
      }
      return
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (size > 0) {
        if (e.repeat) {
          isKeyboardPainting.value = true
          keyboardPaintUseMark.value = e.shiftKey
        } else {
          selectionVisible.value = true
          isKeyboardPainting.value = true
          keyboardPaintUseMark.value = e.shiftKey
          if (e.shiftKey) {
            handleCellRightClick(selectedRow.value, selectedCol.value)
          } else {
            handleCellClick(selectedRow.value, selectedCol.value)
          }
        }
      }
      return
  }

  switch (e.key.toLowerCase()) {
    case 'f':
      currentTool.value = 'fill'
      break
    case 'm':
      currentTool.value = 'mark'
      break
    case 'z':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        handleUndo()
      }
      break
    case 'h':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        handleHint()
      }
      break
  }
}

function handleKeyUp(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    isKeyboardPainting.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('keyup', handleKeyUp)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('keyup', handleKeyUp)
})

const completedRows = computed(() =>
  level.value ? getCompletedRows(grid.value, level.value.solution) : new Set()
)
const completedCols = computed(() =>
  level.value ? getCompletedCols(grid.value, level.value.solution) : new Set()
)

function checkSolution() {
  if (!level.value) return false
  for (let r = 0; r < level.value.size; r++) {
    for (let c = 0; c < level.value.size; c++) {
      const shouldBeFilled = level.value.solution[r][c] === 1
      const cell = grid.value[r][c]
      const isFilled = cell === 'filled' || (cell === 'wrong' && shouldBeFilled)
      if (shouldBeFilled !== isFilled) return false
    }
  }
  return true
}

const victoryStars = ref(0)

const displayTime = computed(
  () => time.value + (hintsUsed.value + wrongClicks.value) * 10
)

watch(
  [displayTime, showPenaltyFlash],
  ([t, flash]) => {
    gameUI.setTime(t)
    gameUI.setPenaltyFlash(flash)
  },
  { immediate: true }
)

watch(
  [grid, moves],
  () => {
    if (checkSolution() && moves.value > 0) {
      const effectiveTime = getEffectiveTime(
        time.value,
        hintsUsed.value,
        wrongClicks.value
      )
      victoryStars.value = getStars(effectiveTime, level.value.size)
      showVictory.value = true
      progressStore.completeLevel(worldId.value, level.value.id, time.value, victoryStars.value)
    }
  },
  { deep: true }
)

function handleCellClickWithSelect(row, col) {
  selectionVisible.value = false
  handleCellClick(row, col)
}

function applyToCell(row, col, addToHistory, useMarkTool) {
  if (addToHistory) {
    history.value.push({
      grid: grid.value.map((r) => [...r]),
      moves: moves.value,
      hintsUsed: hintsUsed.value,
      wrongClicks: wrongClicks.value,
    })
  }
  const newGrid = grid.value.map((r) => [...r])
  const current = newGrid[row][col]
  const shouldBeFilled = level.value.solution[row][col] === 1
  const tool = useMarkTool ? 'mark' : currentTool.value

  if (tool === 'fill') {
    if (current === 'empty' || current === 'marked') {
      if (shouldBeFilled) {
        newGrid[row][col] = 'filled'
      } else {
        newGrid[row][col] = 'wrong'
        wrongClicks.value++
        showPenaltyFlash.value = true
        setTimeout(() => { showPenaltyFlash.value = false }, 600)
      }
    }
  } else {
    if (current === 'empty' || current === 'filled') {
      if (!shouldBeFilled) {
        newGrid[row][col] = 'marked'
      } else {
        newGrid[row][col] = 'wrong'
        wrongClicks.value++
        showPenaltyFlash.value = true
        setTimeout(() => { showPenaltyFlash.value = false }, 600)
      }
    }
  }
  grid.value = newGrid
  if (addToHistory) moves.value++
}

function handleCellClick(row, col) {
  history.value.push({
    grid: grid.value.map((r) => [...r]),
    moves: moves.value,
    hintsUsed: hintsUsed.value,
    wrongClicks: wrongClicks.value,
  })
  const newGrid = grid.value.map((r) => [...r])
  const current = newGrid[row][col]
  const shouldBeFilled = level.value.solution[row][col] === 1

  if (currentTool.value === 'fill') {
    if (current === 'filled') {
      newGrid[row][col] = 'empty'
    } else if (current === 'wrong') {
      newGrid[row][col] = 'empty'
    } else {
      if (shouldBeFilled) {
        newGrid[row][col] = 'filled'
      } else {
        newGrid[row][col] = 'wrong'
        wrongClicks.value++
        showPenaltyFlash.value = true
        setTimeout(() => { showPenaltyFlash.value = false }, 600)
      }
    }
  } else {
    if (current === 'marked') {
      newGrid[row][col] = 'empty'
    } else if (current === 'wrong') {
      newGrid[row][col] = 'empty'
    } else {
      if (!shouldBeFilled) {
        newGrid[row][col] = 'marked'
      } else {
        newGrid[row][col] = 'wrong'
        wrongClicks.value++
        showPenaltyFlash.value = true
        setTimeout(() => { showPenaltyFlash.value = false }, 600)
      }
    }
  }
  grid.value = newGrid
  moves.value++
}

function handleCellRightClickWithSelect(row, col) {
  selectionVisible.value = false
  handleCellRightClick(row, col)
}

function handleCellRightClick(row, col) {
  history.value.push({
    grid: grid.value.map((r) => [...r]),
    moves: moves.value,
    hintsUsed: hintsUsed.value,
    wrongClicks: wrongClicks.value,
  })
  const newGrid = grid.value.map((r) => [...r])
  const current = newGrid[row][col]
  const shouldBeFilled = level.value.solution[row][col] === 1

  if (current === 'marked') {
    newGrid[row][col] = 'empty'
  } else if (current === 'wrong') {
    newGrid[row][col] = 'empty'
  } else {
    if (!shouldBeFilled) {
      newGrid[row][col] = 'marked'
    } else {
      newGrid[row][col] = 'wrong'
      wrongClicks.value++
      showPenaltyFlash.value = true
      setTimeout(() => { showPenaltyFlash.value = false }, 600)
    }
  }
  grid.value = newGrid
  moves.value++
}

function handleUndo() {
  if (history.value.length > 0) {
    const last = history.value[history.value.length - 1]
    grid.value = last.grid
    moves.value = last.moves
    hintsUsed.value = last.hintsUsed ?? 0
    // wrongClicks не отменяем — штраф остаётся даже после отмены
    history.value = history.value.slice(0, -1)
  }
}

function handleHint() {
  if (!level.value) return
  const candidates = []
  for (let r = 0; r < level.value.size; r++) {
    for (let c = 0; c < level.value.size; c++) {
      if (level.value.solution[r][c] === 1 && grid.value[r][c] !== 'filled') {
        candidates.push([r, c])
      }
    }
  }
  if (candidates.length > 0) {
    const [row, col] = candidates[Math.floor(Math.random() * candidates.length)]
    history.value.push({
      grid: grid.value.map((r) => [...r]),
      moves: moves.value,
      hintsUsed: hintsUsed.value,
      wrongClicks: wrongClicks.value,
    })
    hintsUsed.value++
    showPenaltyFlash.value = true
    setTimeout(() => { showPenaltyFlash.value = false }, 600)
    const newGrid = grid.value.map((r) => [...r])
    newGrid[row][col] = 'filled'
    grid.value = newGrid
    moves.value++
  }
}

function doReset() {
  initGrid()
  moves.value = 0
  time.value = 0
  startTime.value = Date.now()
  hintsUsed.value = 0
  wrongClicks.value = 0
  showPenaltyFlash.value = false
  history.value = []
  selectedRow.value = 0
  selectedCol.value = 0
  selectionVisible.value = false
}

function handleRetry() {
  initGrid()
  moves.value = 0
  time.value = 0
  startTime.value = Date.now()
  hintsUsed.value = 0
  wrongClicks.value = 0
  showPenaltyFlash.value = false
  history.value = []
  selectedRow.value = 0
  selectedCol.value = 0
  selectionVisible.value = false
  showVictory.value = false
}

function handleNext() {
  const nextLevel = levels.value.find((l) => l.id === level.value.id + 1)
  if (nextLevel) {
    showVictory.value = false
    router.push(`/world/${worldId.value}/game/${nextLevel.id}`)
  } else {
    router.push(`/world/${worldId.value}/levels`)
  }
}

const hasNextLevel = computed(() =>
  levels.value.some((l) => l.id === level.value?.id + 1)
)
</script>

<style lang="scss" scoped>
@use '../styles/pages/game';
</style>
