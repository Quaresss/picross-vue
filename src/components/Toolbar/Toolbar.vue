<template>
  <div class="toolbar">
    <!-- Desktop -->
    <div class="toolbar__desktop">
      <BaseButton
        :class="{ 'toolbar__btn--active': currentTool === 'fill' }"
        :variant="currentTool === 'fill' ? 'default' : 'outline'"
        size="lg"
        class="toolbar__btn toolbar__btn--fill"
        @click="$emit('tool-change', 'fill')"
      >
        <Paintbrush :size="20" />
        Закрасить
      </BaseButton>

      <BaseButton
        :class="{ 'toolbar__btn--active': currentTool === 'mark' }"
        :variant="currentTool === 'mark' ? 'default' : 'outline'"
        size="lg"
        class="toolbar__btn toolbar__btn--mark"
        @click="$emit('tool-change', 'mark')"
      >
        <X :size="20" />
        Пометить
      </BaseButton>

      <div class="toolbar__divider" />

      <BaseButton
        variant="outline"
        size="lg"
        :disabled="!canUndo"
        class="toolbar__btn"
        @click="$emit('undo')"
      >
        <Undo2 :size="20" />
        Отменить
      </BaseButton>

      <BaseButton
        variant="outline"
        size="lg"
        class="toolbar__btn"
        @click="$emit('hint')"
      >
        <Lightbulb :size="20" />
        Подсказка
      </BaseButton>

      <div class="toolbar__divider" />

      <BaseButton
        variant="outline"
        size="lg"
        class="toolbar__btn"
        @click="$emit('reset')"
      >
        <RotateCcw :size="20" />
        Сброс
      </BaseButton>

      <BaseButton
        variant="outline"
        size="lg"
        class="toolbar__btn"
        @click="$emit('home')"
      >
        <Home :size="20" />
        Меню
      </BaseButton>
    </div>

    <!-- Mobile -->
    <div class="toolbar__mobile">
      <div class="toolbar__mobile-row">
        <BaseButton
          :class="{ 'toolbar__btn--active': currentTool === 'fill' }"
          :variant="currentTool === 'fill' ? 'default' : 'outline'"
          size="lg"
          class="toolbar__btn toolbar__btn--fill"
          @click="$emit('tool-change', 'fill')"
        >
          <Paintbrush :size="20" />
          Закрасить
        </BaseButton>
        <BaseButton
          :class="{ 'toolbar__btn--active': currentTool === 'mark' }"
          :variant="currentTool === 'mark' ? 'default' : 'outline'"
          size="lg"
          class="toolbar__btn toolbar__btn--mark"
          @click="$emit('tool-change', 'mark')"
        >
          <X :size="20" />
          Пометить
        </BaseButton>
      </div>
      <div class="toolbar__mobile-row">
        <BaseButton
          variant="outline"
          size="lg"
          :disabled="!canUndo"
          class="toolbar__btn"
          @click="$emit('undo')"
        >
          <Undo2 :size="20" />
          Отменить
        </BaseButton>
        <BaseButton
          variant="outline"
          size="lg"
          class="toolbar__btn"
          @click="$emit('hint')"
        >
          <Lightbulb :size="20" />
          Подсказка
        </BaseButton>
      </div>
      <div class="toolbar__mobile-row">
        <BaseButton
          variant="outline"
          size="lg"
          class="toolbar__btn"
          @click="$emit('reset')"
        >
          <RotateCcw :size="20" />
          Сброс
        </BaseButton>
        <BaseButton
          variant="outline"
          size="lg"
          class="toolbar__btn"
          @click="$emit('home')"
        >
          <Home :size="20" />
          Меню
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Paintbrush, X, Undo2, Lightbulb, RotateCcw, Home } from 'lucide-vue-next'
import BaseButton from '../ui/BaseButton.vue'

defineProps({
  currentTool: {
    type: String,
    default: 'fill',
    validator: (v) => ['fill', 'mark'].includes(v),
  },
  canUndo: { type: Boolean, default: false },
})

defineEmits(['tool-change', 'undo', 'hint', 'reset', 'home'])
</script>

<style lang="scss" scoped>
@use '../../styles/components/toolbar';
</style>
