<script setup>
import { computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { useToolsStore } from '../../stores/tools'
import { today, isSameDay } from '../../composables/useDate'
import AppCard from '../common/AppCard.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const study = useStudyStore()
const tools = useToolsStore()

const todayTodos = computed(() => {
  const t = today()
  const homeworkTodos = study.homework
    .filter((h) => !h.done && h.deadline && isSameDay(h.deadline, t))
    .map((h) => ({ id: h.id, title: h.content, source: h.subject, type: 'homework' }))
  const todoTodos = tools.todos
    .filter((todo) => !todo.done && todo.deadline && isSameDay(todo.deadline, t))
    .map((todo) => ({ id: todo.id, title: todo.title, source: todo.category || '待办', type: 'todo' }))
  return [...homeworkTodos, ...todoTodos]
})
</script>

<template>
  <AppCard title="今日待办" gradient="bg-grad-purple">
    <EmptyState v-if="todayTodos.length === 0" icon="✨" text="今天没有待办，轻松一下！" />
    <div v-else class="space-y-2">
      <div v-for="item in todayTodos" :key="item.type + item.id" class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
        <span class="text-gray-700 dark:text-gray-200">{{ item.title }}</span>
        <Tag :color="item.type === 'homework' ? 'blue' : 'orange'">{{ item.source }}</Tag>
      </div>
    </div>
  </AppCard>
</template>