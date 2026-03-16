# Руководство по Vue 3 на примере проекта Picross

Подробное объяснение Vue 3 и Composition API на основе кода этого проекта.

---

## Содержание

1. [Структура приложения](#1-структура-приложения)
2. [Точка входа](#2-точка-входа)
3. [SFC — Single File Component](#3-sfc--single-file-component)
4. [Реактивность](#4-реактивность)
5. [Шаблон (Template)](#5-шаблон-template)
6. [Компоненты: Props и Emits](#6-компоненты-props-и-emits)
7. [Жизненный цикл](#7-жизненный-цикл)
8. [Watch — отслеживание изменений](#8-watch--отслеживание-изменений)
9. [Ref для DOM-элементов](#9-ref-для-dom-элементов)
10. [Vue Router](#10-vue-router)
11. [Переходы и анимации](#11-переходы-и-анимации)
12. [Слоты](#12-слоты)
13. [Стили](#13-стили)
14. [Схема потока данных](#14-схема-потока-данных)

---

## 1. Структура приложения

```
src/
├── main.js              # Создаёт приложение Vue, подключает Pinia и router
├── App.vue              # Корневой компонент, Header + RouterView
├── router/
│   └── index.js         # Маршруты: /, /world/:worldId/levels, /world/:worldId/game/:levelId, /faq
├── pages/
│   ├── HomePage.vue     # Выбор мира (Классика, Famicom)
│   ├── LevelsPage.vue   # Выбор уровня в мире
│   ├── GamePage.vue     # Игровое поле
│   ├── FaqPage.vue      # Правила и управление
│   └── NotFoundPage.vue
├── components/
│   ├── LevelCard/       # Карточка уровня (превью 5×5 или полное для пройденных)
│   ├── GameGrid/
│   ├── Header/
│   ├── VictoryModal/
│   └── ui/
├── data/                # worlds.js, levels.js
├── stores/              # Pinia: progress, gameUI
├── utils/
└── styles/
```

---

## 2. Точка входа

**main.js**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())  // Pinia до router
app.use(router)
app.mount('#app')
```

**App.vue** — корень с Header и RouterView:

```vue
<template>
  <Header />
  <main><RouterView /></main>
</template>
```

---

## 3. SFC — Single File Component

Каждый `.vue` файл — это **Single File Component** из трёх секций:

```vue
<template>
  <!-- HTML-разметка с Vue-директивами -->
</template>

<script setup>
  // JavaScript логика (Composition API)
</script>

<style lang="scss" scoped>
  /* Стили (scoped = изолированы от других компонентов) */
</style>
```

- **template** — что рендерится
- **script setup** — состояние и логика
- **style** — CSS/SCSS (опционально)

---

## 4. Реактивность

### ref

`ref()` создаёт реактивную переменную. При изменении Vue автоматически обновляет DOM.

```javascript
const currentPage = ref(1)
const hoveredLevel = ref(null)
const completedLevels = ref(new Set())
```

**В скрипте** — обращение через `.value`:

```javascript
currentPage.value = 2
hoveredLevel.value = { id: 1, name: 'Сердце' }
```

**В шаблоне** — `.value` не нужен (Vue автоматически разворачивает):

```html
<p>Страница {{ currentPage }}</p>
<div v-if="hoveredLevel">...</div>
```

### computed

`computed()` — производное значение. Пересчитывается только при изменении зависимостей.

```javascript
const displayedLevel = computed(() => hoveredLevel.value ?? selectedLevel.value)

const currentPageLevels = computed(() => {
  const start = (currentPage.value - 1) * LEVELS_PER_PAGE
  return levels.slice(start, start + LEVELS_PER_PAGE)
})

const totalPages = computed(() => Math.ceil(levels.length / LEVELS_PER_PAGE))
```

Использование в шаблоне — как обычная переменная:

```html
{{ totalCompleted }} из {{ totalLevels }}
```

### reactive (альтернатива)

Для объектов можно использовать `reactive()`, но в этом проекте везде `ref` — проще и единообразнее.

---

## 5. Шаблон (Template)

### Интерполяция

Вывод данных в разметку:

```html
<h1>Выбор уровня</h1>
<p>Пройдено: {{ totalCompleted }} из {{ totalLevels }} ({{ progressPercentage }}%)</p>
```

Внутри `{{ }}` — любое JavaScript-выражение:

```html
{{ displayedLevel.completed ? displayedLevel.name : '?' }}
```

### v-if / v-else

Условный рендеринг. Элемент добавляется или удаляется из DOM.

```html
<div v-if="displayedLevel" class="levels__info-panel">...</div>

<div v-if="displayedLevel.completed">
  <span v-for="i in 3" ...>★</span>
</div>
<div v-else class="levels__info-preview-question">
  <HelpCircle :size="48" />
</div>
```

### v-for

Цикл по массиву или диапазону:

```html
<button v-for="p in totalPages" :key="p" ...>
  <!-- p = 1, 2, 3, ... -->
</button>

<LevelCard
  v-for="(level, idx) in currentPageLevels"
  :key="level.id"
  :id="level.id"
  ...
/>
```

**Важно:** `:key` должен быть уникальным (обычно `id`). Нужен для корректной работы Vue при обновлении списка.

### v-bind (`:`)

Динамическая привязка атрибутов:

```html
:class="{ 'levels__diamond--active': p === currentPage }"
:class="{ 'level-card--locked': locked, 'level-card--selected': selected }"
:disabled="currentPage === 1"
:style="{ gridTemplateColumns: `repeat(${previewSize}, minmax(0, 1fr))` }"
```

Сокращение: `:attr` вместо `v-bind:attr`.

### v-on (`@`)

Обработчики событий:

```html
@click="router.push('/')"
@click="handleLevelClick(level)"
@click="pageDirection = 1; currentPage = Math.min(totalPages, currentPage + 1)"
@keydown="handleKeydown"
@mouseenter="$emit('hover', { id, name, ... })"
@mouseleave="$emit('hover', null)"
```

- `$event` — объект события (если нужно)
- В `@hover="hoveredLevel = $event"` — `$event` это то, что передано в `$emit('hover', data)`

### Сводка директив

| Директива | Пример | Описание |
|-----------|--------|----------|
| `v-if` | `v-if="displayedLevel"` | Показать/скрыть (удаляет из DOM) |
| `v-else` | `v-else` | Блок «иначе» для `v-if` |
| `v-for` | `v-for="x in items" :key="x.id"` | Цикл |
| `:attr` | `:class="..."` | Динамический атрибут |
| `@event` | `@click="handler"` | Обработчик события |

---

## 6. Компоненты: Props и Emits

### Props — данные от родителя к ребёнку

**Родитель (LevelsPage.vue):**

```html
<LevelCard
  :id="level.id"
  :name="level.name"
  :completed="progressStore.isCompleted(worldId, level.id)"
  :best-time="progressStore.getTime(worldId, level.id)"
  :stars="progressStore.getStars(worldId, level.id)"
  :selected="displayedLevel?.id === level.id"
  @click="handleLevelClick(level)"
  @hover="handleHover"
/>
```

**Ребёнок (LevelCard.vue):**

```javascript
const props = defineProps({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  bestTime: { type: Number, default: undefined },
  stars: { type: Number, default: 0 },
  selected: { type: Boolean, default: false },
  difficulty: {
    type: String,
    required: true,
    validator: (v) => ['easy', 'medium', 'hard'].includes(v),
  },
})
```

В шаблоне и скрипте: `props.id`, `props.completed` и т.д.

### Emits — события от ребёнка к родителю

**Ребёнок объявляет события:**

```javascript
defineEmits(['click', 'hover'])
```

**Ребёнок вызывает:**

```html
@click="!locked && $emit('click')"
@mouseenter="$emit('hover', { id, name, size, completed, bestTime, stars, solution })"
@mouseleave="$emit('hover', null)"
```

**Родитель слушает:**

```html
@click="handleLevelClick(level)"
@hover="hoveredLevel = $event"
```

---

## 7. Жизненный цикл

Хуки выполняются в определённые моменты жизни компонента.

### onMounted

Вызывается после монтирования компонента в DOM. Подходит для:

- загрузки данных;
- подписки на события;
- работы с DOM.

```javascript
onMounted(() => {
  const saved = localStorage.getItem('picross-completed')
  if (saved) {
    completedLevels.value = new Set(JSON.parse(saved))
  }

  isTouchDevice.value = window.matchMedia('(hover: none)').matches
  window.addEventListener('resize', updateGridCols)
  nextTick(() => levelsRef.value?.focus())
})
```

### onUnmounted

Вызывается перед удалением компонента. Используется для очистки:

```javascript
onUnmounted(() => {
  window.removeEventListener('resize', updateGridCols)
})
```

### nextTick

Выполняет callback после того, как Vue обновил DOM:

```javascript
nextTick(() => levelsRef.value?.focus())
```

Без `nextTick` DOM может быть ещё не готов.

---

## 8. Watch — отслеживание изменений

`watch()` реагирует на изменение реактивных данных:

```javascript
watch(currentPage, () => {
  keyboardSelectedIndex.value = 0
  if (!hoveredLevel.value) selectedLevel.value = null
})
```

При смене `currentPage` сбрасываются выбранный индекс и уровень.

Расширенный вариант:

```javascript
watch(source, (newVal, oldVal) => {
  // newVal — новое значение, oldVal — предыдущее
}, { immediate: true })  // immediate: выполнить при создании
```

---

## 9. Ref для DOM-элементов

Чтобы получить ссылку на DOM-элемент:

**В шаблоне:**

```html
<div ref="levelsRef" tabindex="-1" @keydown="handleKeydown">
```

**В скрипте:**

```javascript
const levelsRef = ref(null)

onMounted(() => {
  nextTick(() => levelsRef.value?.focus())
})
```

`levelsRef.value` — это DOM-элемент (после монтирования).

---

## 10. Vue Router

### Конфигурация (router/index.js)

```javascript
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/world/:worldId/levels', name: 'Levels', component: LevelsPage, props: true },
  { path: '/world/:worldId/game/:levelId', name: 'Game', component: GamePage, props: true },
  { path: '/faq', name: 'Faq', component: FaqPage },
  { path: '/levels', redirect: '/world/1/levels' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]
```

### Использование в компонентах

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Переход
router.push('/')
router.push(`/world/${worldId}/levels`)
router.push(`/world/${worldId}/game/${level.id}`)
router.push('/faq')

// Параметры маршрута
const worldId = computed(() => Number(route.params.worldId))
const level = computed(() =>
  levels.find((l) => l.id === Number(route.params.levelId))
)
```

- `router` — навигация;
- `route` — текущий маршрут и его параметры.

---

## 11. Переходы и анимации

Компонент `<Transition>` анимирует появление/исчезновение элемента:

```html
<Transition :name="`levels-page-${pageDirection > 0 ? 'next' : 'prev'}`" mode="out-in">
  <div :key="currentPage" class="levels__grid">
    <LevelCard v-for="level in currentPageLevels" ... />
  </div>
</Transition>
```

- `:key="currentPage"` — при смене ключа Vue считает это новым элементом и запускает анимацию;
- `mode="out-in"` — сначала исчезновение, потом появление.

Классы анимации (без `name`):

```scss
.levels-page-next-enter-from { opacity: 0; transform: translateX(20px); }
.levels-page-next-leave-to { opacity: 0; transform: translateX(-20px); }
.levels-page-prev-enter-from { opacity: 0; transform: translateX(-20px); }
.levels-page-prev-leave-to { opacity: 0; transform: translateX(20px); }
```

---

## 12. Слоты

Слоты позволяют передавать разметку в компонент.

**Родитель:**

```html
<BaseButton variant="outline" @click="router.push('/')">
  <ArrowLeft :size="20" />
  Назад
</BaseButton>
```

**BaseButton.vue:**

```html
<button :class="buttonClasses" @click="$emit('click')">
  <slot />  <!-- Сюда подставится <ArrowLeft /> и "Назад" -->
</button>
```

`<slot />` — место для контента между тегами компонента.

---

## 13. Стили

### scoped

```vue
<style lang="scss" scoped>
@use '../styles/pages/levels';
</style>
```

`scoped` добавляет уникальный атрибут к элементам, чтобы стили не затрагивали другие компоненты.

### Без scoped

Для анимаций Transition нужны глобальные классы:

```vue
<style lang="scss">
.levels-page-next-enter-from { ... }
.levels-page-next-leave-to { ... }
</style>
```

### lang="scss"

Позволяет использовать SCSS (переменные, вложенность, миксины).

---

## 14. Схема потока данных

```
┌─────────────────────────────────────────────────────────────────────┐
│  LevelsPage (родитель)                                               │
│                                                                      │
│  Состояние: currentPage, hoveredLevel, selectedLevel                 │
│  Store: progressStore.isCompleted(worldId, levelId) и т.д.            │
│  Вычисляемое: displayedLevel, currentPageLevels, previewSize         │
│  • previewSize = полная сетка для пройденных, 0 для непройденных     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LevelCard (ребёнок)                                           │  │
│  │  Props: id, name, size, completed, stars, solution, ...        │  │
│  │  Emits: click, hover                                           │  │
│  │  Превью: полная картинка для completed, 5×5 для остальных      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

Правило: данные идут вниз через props, события — вверх через emits. Прогресс хранится в Pinia по ключу `worldId-levelId`.

---

## Импорты из Vue

```javascript
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
```

---

## Краткая шпаргалка

| Задача | Решение |
|--------|---------|
| Реактивная переменная | `ref(value)` |
| Производное значение | `computed(() => ...)` |
| Реакция на изменение | `watch(source, callback)` |
| После монтирования | `onMounted(() => ...)` |
| Перед размонтированием | `onUnmounted(() => ...)` |
| После обновления DOM | `nextTick(() => ...)` |
| Ссылка на DOM | `ref(null)` + `ref="name"` в template |
| Props | `defineProps({ ... })` |
| События наружу | `defineEmits(['click'])` + `$emit('click')` |
| Роутинг | `useRouter()`, `useRoute()` |
