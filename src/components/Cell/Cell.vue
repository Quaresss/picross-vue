<template>
  <div
    class="cell"
    :class="cellClasses"
    :style="cellStyle"
    @click="$emit('click')"
    @contextmenu.prevent="$emit('right-click')"
  >
    <X v-if="state === 'marked'" class="cell__mark" :size="16" />
    <X v-else-if="state === 'wrong'" class="cell__wrong" :size="16" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  state: {
    type: String,
    required: true,
    validator: (v) => ['empty', 'filled', 'marked', 'wrong'].includes(v),
  },
  size: { type: Number, default: 32 },
  isHighlighted: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
})

defineEmits(['click', 'right-click'])

const cellClasses = computed(() => ({
  'cell--empty': props.state === 'empty',
  'cell--filled': props.state === 'filled',
  'cell--marked': props.state === 'marked',
  'cell--wrong': props.state === 'wrong',
  'cell--highlighted': props.isHighlighted,
  'cell--selected': props.isSelected,
}))

const cellStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<style lang="scss" scoped>
@use '../../styles/components/cell';
</style>
