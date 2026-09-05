<template>
  <div class="stack">
    <div class="card stack">
      <div class="row" style="justify-content: space-between">
        <div>
          <h1 class="hero-title">{{ user?.nickname || user?.username || '我的' }}</h1>
          <p class="muted">
            {{ user?.school || '未填写学校' }}
            · {{ user?.degree_tag || '未选学位' }}
            · @{{ user?.username }}
          </p>
        </div>
        <button class="btn ghost" @click="onLogout">退出登录</button>
      </div>
      <div>
        <div class="muted">当前积分</div>
        <div class="points">{{ user?.points ?? '-' }}</div>
      </div>
      <button class="btn secondary" :disabled="loading" @click="refresh">刷新资料</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="card stack">
      <h2>我填写过的</h2>
      <p v-if="!completions.length" class="muted">还没有填写记录。</p>
      <div v-for="item in completions" :key="item.id" class="survey-item">
        <div class="row" style="justify-content: space-between">
          <strong>{{ item.survey_title || `问卷 #${item.survey_id}` }}</strong>
          <span class="badge">+{{ item.points_earned }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMe } from '@/services/auth'
import { listMyCompletions } from '@/services/survey'
import { useUserStore } from '@/stores/user'
import type { Completion } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
const completions = ref<Completion[]>([])
const loading = ref(false)
const error = ref('')

async function refresh() {
  loading.value = true
  error.value = ''
  try {
    userStore.setUserInfo(await fetchMe())
    completions.value = await listMyCompletions()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function onLogout() {
  userStore.logout()
  router.push('/login')
}

onMounted(refresh)
</script>
