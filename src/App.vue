<template>
  <Header
    :time="gameUI.time"
    :show-stats="route.name === 'Game'"
    :show-penalty-flash="gameUI.showPenaltyFlash"
  />
  <RouterView />
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from './components/Header/Header.vue'
import { useGameUIStore } from './stores/gameUI'

const route = useRoute()
const gameUI = useGameUIStore()
</script>

<style lang="scss">
@use './styles/main.scss';
</style>
