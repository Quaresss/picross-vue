<template>
  <div class="game-grid">
    <!-- Column clues -->
    <div class="game-grid__top">
      <div class="game-grid__corner" :style="cornerStyle" />
      <div class="game-grid__col-clues">
        <div
          v-for="(clue, idx) in colClues"
          :key="idx"
          class="game-grid__col-clue"
          :style="clueColStyle"
        >
          <div v-for="(num, i) in clue" :key="i" class="game-grid__clue-num">
            {{ num }}
          </div>
        </div>
      </div>
    </div>

    <!-- Grid with row clues -->
    <div class="game-grid__body">
      <div class="game-grid__row-clues">
        <div
          v-for="(clue, idx) in rowClues"
          :key="idx"
          class="game-grid__row-clue"
          :style="clueRowStyle"
        >
          <span v-for="(num, i) in clue" :key="i" class="game-grid__clue-num">
            {{ num }}
          </span>
        </div>
      </div>

      <div class="game-grid__cells">
        <div
          v-for="(row, rowIdx) in grid"
          :key="rowIdx"
          class="game-grid__row"
        >
          <div
            v-for="(cell, colIdx) in row"
            :key="colIdx"
            class="game-grid__cell-wrapper"
            :class="{
              'game-grid__cell-wrapper--thick-right': (colIdx + 1) % 5 === 0 && colIdx < size - 1,
              'game-grid__cell-wrapper--thick-bottom': (rowIdx + 1) % 5 === 0 && rowIdx < size - 1,
            }"
          >
            <Cell
              :state="cell"
              :size="cellSize"
              :is-highlighted="hoveredRow === rowIdx || hoveredCol === colIdx"
              :is-selected="selectionVisible && selectedRow === rowIdx && selectedCol === colIdx"
              :is-completed="completedRows.has(rowIdx) || completedCols.has(colIdx)"
              @click="onCellClick(rowIdx, colIdx)"
              @right-click="onCellRightClick(rowIdx, colIdx)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Cell from '../Cell/Cell.vue'

const props = defineProps({
  grid: { type: Array, required: true },
  rowClues: { type: Array, required: true },
  colClues: { type: Array, required: true },
  hoveredRow: { type: Number, default: null },
  hoveredCol: { type: Number, default: null },
  selectedRow: { type: Number, default: 0 },
  selectedCol: { type: Number, default: 0 },
  selectionVisible: { type: Boolean, default: false },
  completedRows: { type: Set, default: () => new Set() },
  completedCols: { type: Set, default: () => new Set() },
})

const emit = defineEmits(['cell-click', 'cell-right-click'])

const size = computed(() => props.grid.length)

const cellSize = ref(40)

function calculateCellSize() {
  if (typeof window === 'undefined') return 40
  const screenWidth = window.innerWidth
  const maxWidth = screenWidth > 768 ? 1000 : screenWidth - 80
  const s = size.value
  if (s <= 5) return Math.min(64, Math.floor(maxWidth / (s + 2)))
  if (s <= 10) return Math.min(48, Math.floor(maxWidth / (s + 2)))
  return Math.min(36, Math.floor(maxWidth / (s + 2)))
}

function onResize() {
  cellSize.value = calculateCellSize()
}

onMounted(() => {
  cellSize.value = calculateCellSize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const maxRowClueLength = computed(() =>
  Math.max(...props.rowClues.map((c) => c.length))
)
const maxColClueLength = computed(() =>
  Math.max(...props.colClues.map((c) => c.length))
)

const clueRowWidth = computed(
  () => maxRowClueLength.value * Math.min(40, cellSize.value)
)
const clueColHeight = computed(() => maxColClueLength.value * 28)

const cornerStyle = computed(() => ({
  width: `${clueRowWidth.value}px`,
  height: `${clueColHeight.value}px`,
}))

const clueColStyle = computed(() => ({
  width: `${cellSize.value}px`,
  height: `${clueColHeight.value}px`,
}))

const clueRowStyle = computed(() => ({
  width: `${clueRowWidth.value}px`,
  height: `${cellSize.value}px`,
}))

function onCellClick(row, col) {
  emit('cell-click', row, col)
}

function onCellRightClick(row, col) {
  emit('cell-right-click', row, col)
}
</script>

<style lang="scss" scoped>
@use '../../styles/components/game-grid';
</style>
