<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    type="button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'outline', 'ghost'].includes(v),
  },
  size: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'sm', 'lg', 'icon'].includes(v),
  },
  disabled: Boolean,
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'base-button'
  const variant = `base-button--${props.variant}`
  const size = `base-button--size-${props.size}`
  const disabled = props.disabled ? 'base-button--disabled' : ''
  return [base, variant, size, disabled].filter(Boolean)
})
</script>

<style lang="scss" scoped>
@use '../../styles/components/base-button';
</style>
