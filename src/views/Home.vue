<script setup>
import TodaySchedule from '../components/home/TodaySchedule.vue'
import TodayTodos from '../components/home/TodayTodos.vue'
import SummaryCards from '../components/home/SummaryCards.vue'
import QuickActions from '../components/home/QuickActions.vue'
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">首页总览</h1>
    <QuickActions />
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TodaySchedule />
      <TodayTodos />
    </div>
    <SummaryCards />
  </div>
</template>