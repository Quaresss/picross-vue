<template>
  <div
    ref="levelsRef"
    class="levels"
    :class="{ 'levels--panel-visible': displayedLevel }"
    tabindex="-1"
    @keydown="handleKeydown"
  >
    <div class="levels__container">
      <div class="levels__header">
        <div class="levels__spacer" />
        <div class="levels__title-block">
          <h1 class="levels__title">{{ world?.name ?? 'Выбор уровня' }}</h1>
          <p class="levels__progress">
            Пройдено: {{ totalCompleted }} из {{ totalLevels }} ({{ progressPercentage }}%)
          </p>
        </div>
        <div class="levels__spacer" />
      </div>

      <div class="levels__page-diamonds">
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          class="levels__diamond"
          :class="{ 'levels__diamond--active': p === currentPage }"
          :aria-label="`Страница ${p}`"
          @click="pageDirection = p > currentPage ? 1 : -1; currentPage = p"
        />
      </div>

      <div class="levels__content">
        <BaseButton
          variant="outline"
          size="icon"
          class="levels__page-arrow"
          :disabled="currentPage === 1"
          @click="pageDirection = -1; currentPage = Math.max(1, currentPage - 1)"
        >
          <ChevronLeft :size="24" />
        </BaseButton>
        <div class="levels__grid-wrapper">
          <Transition :name="`levels-page-${pageDirection > 0 ? 'next' : 'prev'}`" mode="out-in">
            <div :key="currentPage" class="levels__grid">
              <LevelCard
                v-for="(level, idx) in currentPageLevels"
                :key="level.id"
                :id="level.id"
                :name="level.name"
                :difficulty="level.difficulty"
                :size="level.size"
                :solution="level.solution"
                :completed="progressStore.isCompleted(worldId, level.id)"
                :best-time="progressStore.getTime(worldId, level.id)"
                :stars="progressStore.getStars(worldId, level.id)"
                :selected="displayedLevel?.id === level.id"
                @click="handleLevelClick(level)"
                @hover="hoveredLevel = $event"
              />
            </div>
          </Transition>
        </div>
        <BaseButton
          variant="outline"
          size="icon"
          class="levels__page-arrow"
          :disabled="currentPage === totalPages"
          @click="pageDirection = 1; currentPage = Math.min(totalPages, currentPage + 1)"
        >
          <ChevronRight :size="24" />
        </BaseButton>
      </div>
    </div>

    <div v-if="displayedLevel" class="levels__bottom-fill" />
    <div v-if="displayedLevel" class="levels__info-panel">
      <div class="levels__info-preview-block">
        <div class="levels__info-preview">
          <div
            v-if="displayedLevel.completed"
            class="levels__info-preview-grid"
            :style="{ gridTemplateColumns: `repeat(${previewSize}, minmax(0, 1fr))` }"
          >
            <div
              v-for="(cell, idx) in flatPreview"
              :key="idx"
              class="levels__info-preview-cell"
              :class="{ 'levels__info-preview-cell--filled': cell === 1 }"
            />
          </div>
          <div v-else class="levels__info-preview-question">
            <HelpCircle :size="48" />
          </div>
        </div>
        <div class="levels__info-stars-row">
        <template v-if="displayedLevel.completed">
          <span
            v-for="i in 3"
            :key="i"
            class="levels__info-star"
            :class="{ 'levels__info-star--earned': i <= (displayedLevel.stars || 0) }"
            >★</span>
          </template>
          <span v-else class="levels__info-dash">—</span>
        </div>
      </div>
      <div class="levels__info-grid">
        <div class="levels__info-column">
          <div class="levels__info-item">
            <span class="levels__info-label">Уровень</span>
            <span class="levels__info-value">{{ displayedLevel.id }}</span>
          </div>
          <div class="levels__info-item">
            <span class="levels__info-label">Размер</span>
            <span class="levels__info-value">{{ displayedLevel.size }}×{{ displayedLevel.size }}</span>
          </div>
        </div>
        <div class="levels__info-column">
          <div class="levels__info-item">
            <span class="levels__info-label">Название</span>
            <span class="levels__info-value">{{ displayedLevel.completed ? displayedLevel.name : '?' }}</span>
          </div>
          <div class="levels__info-item">
            <span class="levels__info-label">Время</span>
            <span class="levels__info-value">
              {{ displayedLevel.completed && displayedLevel.bestTime !== undefined ? formatTime(displayedLevel.bestTime) : '?' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progress'
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseButton from '../components/ui/BaseButton.vue'
import LevelCard from '../components/LevelCard/LevelCard.vue'
import { worlds, getLevelsByWorld } from '../data/worlds'

const props = defineProps({ worldId: { type: [String, Number], required: true } })
const worldId = computed(() => Number(props.worldId))
const world = computed(() => worlds.find((w) => w.id === worldId.value))
const levels = computed(() => getLevelsByWorld(worldId.value) ?? [])

const router = useRouter()
const progressStore = useProgressStore()
const LEVELS_PER_PAGE = 15
const hoveredLevel = ref(null)
const selectedLevel = ref(null)
const currentPage = ref(1)
const pageDirection = ref(1)
const keyboardSelectedIndex = ref(0)
const gridCols = ref(3)
const levelsRef = ref(null)
const isTouchDevice = ref(false)

const displayedLevel = computed(() => hoveredLevel.value ?? selectedLevel.value)

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getLevelHoverData(level) {
  return {
    id: level.id,
    name: level.name,
    size: level.size,
    completed: progressStore.isCompleted(worldId.value, level.id),
    bestTime: progressStore.getTime(worldId.value, level.id),
    stars: progressStore.getStars(worldId.value, level.id),
    solution: level.solution,
  }
}

function updateGridCols() {
  const w = window.innerWidth
  gridCols.value = w >= 900 ? 5 : w >= 600 ? 4 : 3
}

function handleKeydown(e) {
  const pageLevels = currentPageLevels.value
  if (pageLevels.length === 0) return

  const cols = gridCols.value
  const rows = Math.ceil(LEVELS_PER_PAGE / cols)
  let idx = keyboardSelectedIndex.value

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    idx = (idx + 1) % pageLevels.length
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    idx = (idx - 1 + pageLevels.length) % pageLevels.length
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    idx = Math.min(idx + cols, pageLevels.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    idx = Math.max(idx - cols, 0)
  } else if (e.key === 'Enter' && displayedLevel.value) {
    e.preventDefault()
    router.push(`/world/${worldId.value}/game/${displayedLevel.value.id}`)
    return
  } else {
    return
  }

  keyboardSelectedIndex.value = idx
  selectedLevel.value = getLevelHoverData(pageLevels[idx])
}

function handleLevelClick(level) {
  if (isTouchDevice.value) {
    if (displayedLevel.value?.id === level.id) {
      router.push(`/world/${worldId.value}/game/${level.id}`)
    } else {
      selectedLevel.value = getLevelHoverData(level)
      const idx = currentPageLevels.value.findIndex((l) => l.id === level.id)
      if (idx >= 0) keyboardSelectedIndex.value = idx
    }
  } else {
    router.push(`/world/${worldId.value}/game/${level.id}`)
  }
}

onMounted(() => {
  progressStore.loadFromLocalStorage()

  isTouchDevice.value = window.matchMedia('(hover: none)').matches
  updateGridCols()
  window.addEventListener('resize', updateGridCols)
  nextTick(() => levelsRef.value?.focus())
})

onUnmounted(() => {
  window.removeEventListener('resize', updateGridCols)
})

watch(currentPage, () => {
  keyboardSelectedIndex.value = 0
  if (!hoveredLevel.value) selectedLevel.value = null
})

watch(worldId, () => {
  currentPage.value = 1
  keyboardSelectedIndex.value = 0
  selectedLevel.value = null
})

watch(world, (w) => {
  if (!w && worldId.value) router.replace('/')
}, { immediate: true })

const previewSize = computed(() =>
  displayedLevel.value?.completed ? (displayedLevel.value.solution?.length ?? 0) : 0
)

const flatPreview = computed(() => {
  if (!displayedLevel.value?.solution || !displayedLevel.value?.completed) return []
  return displayedLevel.value.solution.flat()
})

const totalPages = computed(() => Math.ceil(levels.value.length / LEVELS_PER_PAGE))

const currentPageLevels = computed(() => {
  const start = (currentPage.value - 1) * LEVELS_PER_PAGE
  return levels.value.slice(start, start + LEVELS_PER_PAGE)
})

const totalCompleted = computed(() => progressStore.completedInWorld(worldId.value))
const totalLevels = computed(() => levels.value.length)
const progressPercentage = computed(() =>
  Math.round((totalCompleted.value / totalLevels.value) * 100)
)
</script>

<style lang="scss" scoped>
@use '../styles/pages/levels';
</style>

<style lang="scss">
.levels-page-next-enter-active,
.levels-page-next-leave-active,
.levels-page-prev-enter-active,
.levels-page-prev-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.levels-page-next-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.levels-page-next-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.levels-page-prev-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.levels-page-prev-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
