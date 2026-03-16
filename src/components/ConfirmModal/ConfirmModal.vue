<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="confirm-modal" @click.self="$emit('cancel')">
        <div class="confirm-modal__backdrop" />
        <div class="confirm-modal__content">
          <h3 class="confirm-modal__title">{{ title }}</h3>
          <p class="confirm-modal__message">{{ message }}</p>
          <div class="confirm-modal__actions">
            <BaseButton
              variant="outline"
              size="lg"
              class="confirm-modal__btn"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </BaseButton>
            <BaseButton
              size="lg"
              class="confirm-modal__btn confirm-modal__btn--primary"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import BaseButton from '../ui/BaseButton.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Подтверждение' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Да' },
  cancelText: { type: String, default: 'Отмена' },
})

defineEmits(['confirm', 'cancel'])
</script>

<style lang="scss" scoped>
@use '../../styles/components/confirm-modal';
</style>
