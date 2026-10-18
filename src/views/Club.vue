<script setup>
import { ref } from 'vue'
import ClubManager from '../components/club/ClubManager.vue'
import ActivityManager from '../components/club/ActivityManager.vue'
import PostManager from '../components/club/PostManager.vue'

const activeTab = ref('club')
const tabs = [
  { key: 'club', label: '社团', icon: '👥' },
  { key: 'activity', label: '活动', icon: '📅' },
  { key: 'post', label: '动态', icon: '💬' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">社团社交</h1>
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-xl font-medium transition-all"
        :class="
          activeTab === tab.key
            ? 'bg-grad-blue text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        "
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>
    <ClubManager v-if="activeTab === 'club'" />
    <ActivityManager v-else-if="activeTab === 'activity'" />
    <PostManager v-else-if="activeTab === 'post'" />
  </div>
</template>