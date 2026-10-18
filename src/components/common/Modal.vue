<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: '' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
      <div
        class="relative bg-white dark:bg-gray-800 rounded-xl2 shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
      >
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700"
        >
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ title }}</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        <div class="p-5">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>