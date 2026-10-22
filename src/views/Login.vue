<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { saveUserData, loadUserData } from '../utils/userData.js'
import { LogIn, UserPlus, User, Lock, Bot, X } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const title = computed(() => (mode.value === 'login' ? '登录' : '注册'))

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      const result = await auth.login(username.value, password.value)
      if (result.error) {
        errorMsg.value = result.error
        return
      }
      loadUserData(username.value)
      router.push('/')
    } else {
      const result = await auth.register(username.value, password.value)
      if (result.error) {
        errorMsg.value = result.error
        return
      }
      const loginResult = await auth.login(username.value, password.value)
      if (loginResult.error) {
        errorMsg.value = loginResult.error
        return
      }
      loadUserData(username.value)
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
}

function quickLogin(name) {
  username.value = name
  mode.value = 'login'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-3">
          <Bot class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">校园一站式 APP</h1>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">{{ title }}</p>
      </div>

      <div v-if="errorMsg" class="mb-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 text-sm flex items-center justify-between">
        <span>{{ errorMsg }}</span>
        <button @click="errorMsg = ''"><X class="w-4 h-4" /></button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          :disabled="loading || !username || !password"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          <LogIn v-if="mode === 'login'" class="w-5 h-5" />
          <UserPlus v-else class="w-5 h-5" />
          {{ title }}
        </button>
      </form>

      <div v-if="auth.users.length > 0 && mode === 'login'" class="mt-6">
        <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">已有用户（点击快速选择）</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="user in auth.users"
            :key="user.username"
            @click="quickLogin(user.username)"
            class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            {{ user.username }}
          </button>
        </div>
      </div>

      <p class="text-center mt-6 text-sm text-gray-400 dark:text-gray-500">
        {{ mode === 'login' ? '没有账号？' : '已有账号？' }}
        <button @click="switchMode" class="text-blue-500 hover:underline">
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </button>
      </p>
    </div>
  </div>
</template>