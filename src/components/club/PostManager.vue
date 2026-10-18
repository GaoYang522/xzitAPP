<script setup>
import { ref, computed } from 'vue'
import { useClubStore } from '../../stores/club'
import { formatDateTime } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const club = useClubStore()
const showForm = ref(false)
const filterTag = ref('')
const form = ref({ title: '', content: '', tags: '' })

const allTags = computed(() => {
  const set = new Set()
  club.posts.forEach((p) => {
    ;(p.tags || '').split(/[,，]/).forEach((t) => t.trim() && set.add(t.trim()))
  })
  return [...set]
})

const filtered = computed(() =>
  club.posts.filter((p) => {
    if (!filterTag.value) return true
    return (p.tags || '').includes(filterTag.value)
  })
)

function openAdd() {
  form.value = { title: '', content: '', tags: '' }
  showForm.value = true
}
function save() {
  if (!form.value.title) return
  club.addPost({ ...form.value, time: formatDateTime(new Date()) })
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">💬 校园动态</h2>
      <Btn @click="openAdd">+ 发帖</Btn>
    </div>

    <div v-if="allTags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <button @click="filterTag = ''" :class="['px-3 py-1 rounded-full text-sm', !filterTag ? 'bg-grad-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']">全部</button>
      <button v-for="tag in allTags" :key="tag" @click="filterTag = tag" :class="['px-3 py-1 rounded-full text-sm', filterTag === tag ? 'bg-grad-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']">{{ tag }}</button>
    </div>

    <EmptyState v-if="filtered.length === 0" icon="💬" text="还没有动态，发一条吧" />

    <div v-else class="space-y-3">
      <div v-for="post in filtered" :key="post.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 dark:text-white">{{ post.title }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">{{ post.time }}</span>
            <button @click="club.removePost(post.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ post.content }}</p>
        <div v-if="post.tags" class="flex flex-wrap gap-1 mt-2">
          <Tag v-for="t in (post.tags || '').split(/[,，]/).filter(Boolean)" :key="t" color="pink">{{ t.trim() }}</Tag>
        </div>
      </div>
    </div>

    <Modal :show="showForm" title="发帖" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">标题</label>
          <input v-model="form.title" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">内容</label>
          <textarea v-model="form.content" rows="5" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">标签（逗号分隔）</label>
          <input v-model="form.tags" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：求助,分享" />
        </div>
      </div>
      <template #footer>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">发布</Btn>
      </template>
    </Modal>
  </div>
</template>