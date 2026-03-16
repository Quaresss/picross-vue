<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="victory-modal" @click.self="$emit('close')">
        <div class="victory-modal__backdrop" />
        <div class="victory-modal__content">
          <button
            type="button"
            class="victory-modal__close"
            aria-label="Закрыть"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>

          <div class="victory-modal__header">
            <div class="victory-modal__icon">
              <Trophy :size="40" />
            </div>
            <h2 class="victory-modal__title">Уровень пройден!</h2>
            <div
              v-if="flatPreview.length"
              class="victory-modal__preview"
              :style="{ gridTemplateColumns: `repeat(${previewSize}, minmax(0, 1fr))` }"
            >
              <div
                v-for="(cell, idx) in flatPreview"
                :key="idx"
                class="victory-modal__preview-cell"
                :class="{ 'victory-modal__preview-cell--filled': cell === 1 }"
              />
            </div>
            <div class="victory-modal__stars">
              <span
                v-for="i in 3"
                :key="i"
                class="victory-modal__star"
                :class="{ 'victory-modal__star--earned': i <= stars }"
              >
                ★
              </span>
            </div>
          </div>

          <div class="victory-modal__stats">
            <div class="victory-modal__stat">
              <Clock class="victory-modal__stat-icon" :size="24" />
              <div class="victory-modal__stat-label">Время</div>
              <div class="victory-modal__stat-value">{{ formatTime(time) }}</div>
            </div>
          </div>

          <div class="victory-modal__actions">
            <BaseButton
              v-if="hasNext"
              size="lg"
              class="victory-modal__btn victory-modal__btn--primary"
              @click="$emit('next')"
            >
              Следующий уровень
              <ArrowRight :size="20" />
            </BaseButton>
            <BaseButton
              variant="outline"
              size="lg"
              class="victory-modal__btn"
              @click="$emit('retry')"
            >
              <RotateCcw :size="20" />
              Повторить
            </BaseButton>
            <BaseButton
              variant="outline"
              size="lg"
              class="victory-modal__btn"
              @click="$emit('home')"
            >
              <Home :size="20" />
              В меню
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import confetti from 'canvas-confetti'
import { Trophy, Clock, ArrowRight, RotateCcw, Home, X } from 'lucide-vue-next'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  time: { type: Number, default: 0 },
  stars: { type: Number, default: 0 },
  solution: { type: Array, default: () => [] },
  hasNext: { type: Boolean, default: true },
})

const previewSize = computed(() => props.solution?.length ?? 0)

const flatPreview = computed(() => {
  if (!props.solution?.length) return []
  return props.solution.flat()
})

defineEmits(['close', 'retry', 'home', 'next'])

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0080ff', '#22a34a', '#e6a800'],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0080ff', '#22a34a', '#e6a800'],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }
)
</script>

<style lang="scss" scoped>
@use '../../styles/components/victory-modal';
</style>
