<script setup>
import Btn from './Btn.vue'
defineProps({
  show: Boolean,
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')" />
      <div class="relative bg-white dark:bg-gray-800 rounded-xl2 shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">{{ title }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-5">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <Btn variant="secondary" @click="emit('cancel')">取消</Btn>
          <Btn variant="danger" @click="emit('confirm')">确认</Btn>
        </div>
      </div>
    </div>
  </Teleport>
</template>