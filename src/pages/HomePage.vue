<template>
  <div class="home">
    <div class="home__content">
      <div class="home__hero">
        <h1 class="home__title">Picross</h1>
        <p class="home__subtitle">Японские кроссворды — логические головоломки</p>
      </div>

      <div class="home__worlds">
        <h2 class="home__worlds-title">Выберите мир</h2>
        <div class="home__diamonds">
          <button
            v-for="world in worlds"
            :key="world.id"
            type="button"
            class="home__diamond-btn"
            :aria-label="`Мир ${world.id}: ${world.name}`"
            @click="router.push(`/world/${world.id}/levels`)"
          >
            <span class="home__diamond">
              <span class="home__diamond-num">{{ world.id }}</span>
            </span>
            <span class="home__diamond-name">{{ world.name }}</span>
          </button>
        </div>
      </div>

      <div class="home__actions">
        <BaseButton
          variant="outline"
          size="default"
          class="home__faq-btn"
          @click="router.push('/faq')"
        >
          <HelpCircle :size="20" />
          FAQ — как играть и управление
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HelpCircle } from 'lucide-vue-next'
import BaseButton from '../components/ui/BaseButton.vue'
import { worlds } from '../data/worlds'

const router = useRouter()
</script>

<style lang="scss" scoped>
@use '../styles/pages/home';
</style>
