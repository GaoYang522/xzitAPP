<script setup>
defineProps({
  title: { type: String, default: '' },
  gradient: { type: String, default: '' },
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl2 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
  >
    <div
      v-if="title"
      class="px-5 py-3 font-semibold text-white flex items-center justify-between"
      :class="gradient"
    >
      <div class="flex items-center gap-2">
        <slot name="title-icon" />
        <span>{{ title }}</span>
      </div>
      <slot name="title-action" />
    </div>
    <div class="p-5">
      <slot />
    </div>
  </div>
</template>