# Руководство по Pinia в проекте Picross

Pinia — официальная библиотека управления состоянием для Vue 3. В этом проекте она хранит прогресс игры (пройденные уровни, время, звёзды).

---

## Содержание

1. [Что такое Pinia](#1-что-такое-pinia)
2. [Установка и подключение](#2-установка-и-подключение)
3. [Структура store](#3-структура-store)
4. [State — состояние](#4-state--состояние)
5. [Getters — вычисляемые значения](#5-getters--вычисляемые-значения)
6. [Actions — действия](#6-actions--действия)
7. [Использование в компонентах](#7-использование-в-компонентах)
8. [Store Options API vs Setup Store](#8-store-options-api-vs-setup-store)
9. [Персистентность (localStorage)](#9-персистентность-localstorage)
10. [Полезные паттерны](#10-полезные-паттерны)

---

## 1. Что такое Pinia

- **Глобальное состояние** — данные, доступные в любом компоненте
- **Централизованная логика** — действия по изменению состояния в одном месте
- **Реактивность** — компоненты автоматически обновляются при изменении store
- **DevTools** — интеграция с Vue DevTools для отладки

**Когда использовать:**
- Данные нужны в нескольких компонентах (LevelsPage, GamePage)
- Нужна синхронизация между страницами
- Сложная логика обновления состояния

---

## 2. Установка и подключение

### Установка

```bash
npm install pinia
```

### Подключение в main.js

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())  // Важно: Pinia должна быть до router
app.use(router)
app.mount('#app')
```

**Порядок:** `createPinia()` подключается до `router`, чтобы store был доступен в навигационных хуках.

---

## 3. Структура store

Файл: `src/stores/progress.js`

```javascript
import { defineStore } from 'pinia'

export const useProgressStore = defineStore('progress', {
  state: () => ({ ... }),    // Состояние
  getters: { ... },          // Вычисляемые значения
  actions: { ... },          // Методы для изменений
})
```

**Именование:** `useProgressStore` — соглашение Vue 3 (префикс `use` для composables/stores).

---

## 4. State — состояние

Начальное состояние store. Функция `state` возвращает объект.

```javascript
state: () => ({
  completedLevels: new Set(['1-1', '1-2', '2-1']),  // ключи "worldId-levelId"
  levelTimes: { '1-1': 45, '1-2': 120 },
  levelStars: { '1-1': 3, '1-2': 2 },
}),
```

**Важно:** `state` — это функция, а не объект. Так каждый экземпляр store получает свою копию состояния. Ключи прогресса — строки `"worldId-levelId"` для поддержки нескольких миров.

### Прямое изменение (в компонентах)

```javascript
const store = useProgressStore()
store.completedLevels.add('1-5')
```

Но лучше менять состояние через **actions** — так логика остаётся в store.

---

## 5. Getters — вычисляемые значения

Getters — аналог `computed` для store. Принимают `state` как первый аргумент.

```javascript
getters: {
  isCompleted: (state) => (worldId, levelId) =>
    state.completedLevels.has(`${worldId}-${levelId}`),
  getTime: (state) => (worldId, levelId) =>
    state.levelTimes[`${worldId}-${levelId}`],
  getStars: (state) => (worldId, levelId) =>
    state.levelStars[`${worldId}-${levelId}`] ?? 0,
  totalCompleted: (state) => state.completedLevels.size,
  completedInWorld: (state) => (worldId) =>
    [...state.completedLevels].filter((k) => k.startsWith(`${worldId}-`)).length,
},
```

### Getter как функция (с параметром)

```javascript
isCompleted: (state) => (worldId, levelId) =>
  state.completedLevels.has(`${worldId}-${levelId}`)
```

Использование: `store.isCompleted(1, 5)` — вернёт `true` или `false`.

### Getter с доступом к другим getters

```javascript
getters: {
  totalLevels: (state) => state.levels.length,
  progress: (state, getters) => (state.completed / getters.totalLevels) * 100,
},
```

---

## 6. Actions — действия

Actions — методы для изменения состояния. Могут быть асинхронными.

```javascript
actions: {
  completeLevel(worldId, levelId, time, stars) {
    const key = `${worldId}-${levelId}`
    this.completedLevels.add(key)
    this.levelTimes[key] = time
    this.levelStars[key] = Math.max(this.levelStars[key] ?? 0, stars)
    this.persist()
  },

  persist() {
    saveToStorage(STORAGE_KEYS.completed, [...this.completedLevels])
    saveToStorage(STORAGE_KEYS.times, this.levelTimes)
    saveToStorage(STORAGE_KEYS.stars, this.levelStars)
  },
},
```

Внутри actions `this` — сам store. Доступ к state, getters и другим actions через `this`.

---

## 7. Использование в компонентах

### Подключение store

```javascript
import { useProgressStore } from '../stores/progress'

const progressStore = useProgressStore()
```

### В шаблоне

```html
<LevelCard
  :completed="progressStore.isCompleted(worldId, level.id)"
  :best-time="progressStore.getTime(worldId, level.id)"
  :stars="progressStore.getStars(worldId, level.id)"
/>
```

### В скрипте

```javascript
// Getters
progressStore.isCompleted(worldId, levelId)
progressStore.getTime(worldId, levelId)
progressStore.completedInWorld(worldId)
progressStore.totalCompleted

// Actions
progressStore.completeLevel(worldId, levelId, time, stars)
progressStore.loadFromLocalStorage()
```

### Деструктуризация с storeToRefs

Если нужны только отдельные поля и сохранить реактивность:

```javascript
import { storeToRefs } from 'pinia'
import { useProgressStore } from '../stores/progress'

const store = useProgressStore()
const { completedLevels, totalCompleted } = storeToRefs(store)
// completedLevels и totalCompleted — реактивные refs
```

**Важно:** Обычный деструкт `const { x } = store` теряет реактивность. Используй `storeToRefs` для state и getters.

---

## 8. Store Options API vs Setup Store

### Options API (как в проекте)

```javascript
export const useProgressStore = defineStore('progress', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})
```

### Setup Store (альтернатива, похожа на Composition API)

```javascript
export const useProgressStore = defineStore('progress', () => {
  const completedLevels = ref(new Set())
  const levelTimes = ref({})

  const isCompleted = (levelId) => completedLevels.value.has(levelId)
  function completeLevel(levelId, time, stars) { ... }

  return { completedLevels, levelTimes, isCompleted, completeLevel }
})
```

Оба варианта валидны. Options API удобнее для простых store.

---

## 9. Персистентность (localStorage)

В проекте прогресс сохраняется в `localStorage` вручную в action `persist()`:

```javascript
persist() {
  saveToStorage(STORAGE_KEYS.completed, [...this.completedLevels])
  saveToStorage(STORAGE_KEYS.times, this.levelTimes)
  saveToStorage(STORAGE_KEYS.stars, this.levelStars)
}
```

### Плагин pinia-plugin-persistedstate (опционально)

Для автоматического сохранения можно использовать плагин:

```bash
npm install pinia-plugin-persistedstate
```

```javascript
// main.js
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
```

```javascript
// store
export const useProgressStore = defineStore('progress', {
  state: () => ({ ... }),
  persist: {
    key: 'picross-progress',
    storage: localStorage,
    paths: ['completedLevels', 'levelTimes', 'levelStars'],
  },
})
```

---

## 10. Полезные паттерны

### Несколько store

```javascript
// stores/progress.js
export const useProgressStore = defineStore('progress', { ... })

// stores/settings.js
export const useSettingsStore = defineStore('settings', { ... })
```

Использование в одном компоненте:

```javascript
const progressStore = useProgressStore()
const settingsStore = useSettingsStore()
```

### Store в router

```javascript
router.beforeEach((to, from, next) => {
  const store = useProgressStore()
  const worldId = Number(to.params.worldId)
  const levelId = Number(to.params.levelId)
  if (to.name === 'Game' && !store.isCompleted(worldId, levelId)) {
    // проверка доступа
  }
  next()
})
```

### Сброс store

```javascript
const store = useProgressStore()
store.$reset()  // Сбрасывает state к начальному значению
```

---

## Файлы проекта с Pinia

| Файл | Назначение |
|------|------------|
| `src/main.js` | `app.use(createPinia())` |
| `src/stores/progress.js` | Store прогресса (миры, уровни, время, звёзды) |
| `src/stores/gameUI.js` | Store UI игры (время, штраф) |
| `src/pages/LevelsPage.vue` | `useProgressStore()` — отображение прогресса по миру |
| `src/pages/GamePage.vue` | `useProgressStore()` — сохранение при победе |

---

## Краткая шпаргалка

| Задача | Код |
|--------|-----|
| Создать store | `defineStore('id', { state, getters, actions })` |
| Использовать в компоненте | `const store = useProgressStore()` |
| Читать state | `store.completedLevels` |
| Вызвать getter | `store.isCompleted(worldId, levelId)` |
| Вызвать action | `store.completeLevel(worldId, levelId, time, stars)` |
| Деструктурировать с реактивностью | `storeToRefs(store)` |
| Сбросить store | `store.$reset()` |
