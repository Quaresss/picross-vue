<template>
  <header class="header">
    <div class="header__inner">
      <button
        type="button"
        class="header__brand"
        @click="router.push('/')"
      >
        <span class="header__diamond" />
        <span class="header__brand-text">Picross</span>
      </button>

      <div v-if="showStats" class="header__stats">
        <div
          class="header__stat"
          :class="{ 'header__stat--penalty-flash': showPenaltyFlash }"
        >
          <Clock class="header__icon" :size="20" />
          <span class="header__value">{{ formatTime(time) }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Clock } from 'lucide-vue-next'

defineProps({
  time: { type: Number, default: 0 },
  showPenaltyFlash: { type: Boolean, default: false },
  showStats: { type: Boolean, default: true },
})

const router = useRouter()

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
@use '../../styles/components/header';
</style>
