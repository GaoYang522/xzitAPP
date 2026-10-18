<script setup>
import { ref } from 'vue'
import CardWallet from '../components/life/CardWallet.vue'
import CanteenManager from '../components/life/CanteenManager.vue'
import PlaceManager from '../components/life/PlaceManager.vue'
import PackageManager from '../components/life/PackageManager.vue'

const activeTab = ref('card')
const tabs = [
  { key: 'card', label: '一卡通', icon: '💳' },
  { key: 'canteen', label: '食堂', icon: '🍽️' },
  { key: 'place', label: '地点', icon: '📍' },
  { key: 'package', label: '快递', icon: '📦' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">校园生活</h1>
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
    <CardWallet v-if="activeTab === 'card'" />
    <CanteenManager v-else-if="activeTab === 'canteen'" />
    <PlaceManager v-else-if="activeTab === 'place'" />
    <PackageManager v-else-if="activeTab === 'package'" />
  </div>
</template>