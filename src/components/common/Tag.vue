<script setup>
defineProps({
  color: { type: String, default: 'blue' },
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': color === 'blue',
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300':
        color === 'purple',
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300':
        color === 'orange',
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': color === 'green',
      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300': color === 'pink',
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': color === 'red',
      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': color === 'gray',
    }"
  >
    <slot />
  </span>
</template>