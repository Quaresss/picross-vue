<template>
  <div class="not-found">
    <h1 class="not-found__title">404</h1>
    <p class="not-found__text">Страница не найдена</p>
    <BaseButton @click="$router.push('/')">На главную</BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '../components/ui/BaseButton.vue'
</script>

<style lang="scss" scoped>
@use '../styles/pages/not-found';
</style>
