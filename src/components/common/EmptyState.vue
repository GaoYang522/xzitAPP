<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  text: { type: String, default: '暂无数据' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="text-4xl mb-3">{{ icon }}</div>
    <p class="text-gray-400 dark:text-gray-500">{{ text }}</p>
  </div>
</template>