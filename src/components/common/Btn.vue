<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button
    :type="type"
    class="rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variant === 'primary' && 'bg-grad-blue text-white shadow-md hover:shadow-lg',
      variant === 'secondary' &&
        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
      variant === 'danger' && 'bg-red-500 text-white shadow-md hover:bg-red-600',
      variant === 'success' && 'bg-grad-green text-white shadow-md hover:shadow-lg',
      variant === 'ghost' &&
        'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2 text-sm',
      size === 'lg' && 'px-5 py-2.5 text-base',
    ]"
  >
    <slot />
  </button>
</template>