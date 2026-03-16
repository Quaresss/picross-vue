<template>
  <button
    type="button"
    class="level-card"
    :class="{
      'level-card--locked': locked,
      'level-card--completed': completed,
      'level-card--selected': selected,
    }"
    :disabled="locked"
    @click="!locked && $emit('click')"
    @mouseenter="$emit('hover', { id, name, size, completed, bestTime, stars, solution })"
    @mouseleave="$emit('hover', null)"
  >
    <div v-if="locked" class="level-card__lock">
      <Lock :size="20" />
    </div>

    <div v-if="completed && stars > 0" class="level-card__stars">
      <span
        v-for="i in 3"
        :key="i"
        class="level-card__star"
        :class="{ 'level-card__star--earned': i <= stars }"
      >
        ★
      </span>
    </div>

    <div class="level-card__preview">
      <div
        v-if="completed"
        class="level-card__preview-grid"
        :style="{ gridTemplateColumns: `repeat(${previewSize}, minmax(0, 1fr))` }"
      >
        <div
          v-for="(cell, idx) in flatPreview"
          :key="idx"
          class="level-card__preview-cell"
          :class="{ 'level-card__preview-cell--filled': cell === 1 }"
        />
      </div>
      <div v-else class="level-card__question">
        <HelpCircle :size="48" />
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Lock, HelpCircle } from 'lucide-vue-next'

const props = defineProps({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    validator: (v) => ['easy', 'medium', 'hard'].includes(v),
  },
  size: { type: Number, required: true },
  solution: { type: Array, required: true },
  completed: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  bestTime: { type: Number, default: undefined },
  stars: { type: Number, default: 0 },
  selected: { type: Boolean, default: false },
})

defineEmits(['click', 'hover'])

const previewSize = computed(() => (props.completed ? props.size : Math.min(props.size, 5)))

const previewSolution = computed(() => {
  const s = previewSize.value
  return props.solution.slice(0, s).map((row) => row.slice(0, s))
})

const flatPreview = computed(() => previewSolution.value.flat())
</script>

<style lang="scss" scoped>
@use '../../styles/components/level-card';
</style>
