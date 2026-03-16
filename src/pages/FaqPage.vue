<template>
  <div class="faq">
    <div class="faq__content">
      <section class="faq__section">
        <h2 class="faq__section-title">Как играть</h2>
        <ul class="faq__list">
          <li>Закрашивайте клетки сетки по числовым подсказкам</li>
          <li>Каждое число показывает длину группы закрашенных клеток</li>
          <li>Порядок чисел = порядок групп (слева направо для строк)</li>
          <li>Между группами должна быть минимум одна пустая клетка</li>
          <li>Используйте правую кнопку мыши или режим «Пометить» для отметки пустых клеток</li>
        </ul>
      </section>

      <section class="faq__section">
        <h2 class="faq__section-title">Управление</h2>
        <p class="faq__intro">
          В игре доступны два вида управления — выберите удобный способ:
        </p>
        <div class="faq__controls-grid">
          <div class="faq__control-card">
            <div class="faq__control-icon">
              <Mouse :size="28" />
            </div>
            <div class="faq__control-content">
              <h3 class="faq__control-label">Мышью</h3>
              <p class="faq__control-desc">
                Кликайте по клеткам левой кнопкой для закрашивания, правой — для пометки пустых
              </p>
            </div>
          </div>
          <div class="faq__control-card">
            <div class="faq__control-icon">
              <Keyboard :size="28" />
            </div>
            <div class="faq__control-content">
              <h3 class="faq__control-label">Клавиатурой</h3>
              <p class="faq__control-desc">
                Стрелки — выбор клетки, Enter — закрасить или пометить. Зажатый Enter + стрелки — заливка
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { Mouse, Keyboard } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
@use '../styles/pages/faq';
</style>
