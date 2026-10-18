<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-center gap-2 mb-4">
    <span v-if="icon" class="text-xl">{{ icon }}</span>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ title }}</h2>
    <div class="flex-1" />
    <slot name="action" />
  </div>
</template>