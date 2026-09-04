<template>
  <div class="stack">
    <div class="card stack">
      <div class="row" style="justify-content: space-between">
        <div>
          <h1 class="hero-title">问卷大厅</h1>
          <p class="muted">填写他人问卷赚积分，再用积分发布自己的问卷</p>
        </div>
        <button class="btn secondary" @click="load">刷新</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="!loading && !list.length" class="muted">暂时没有进行中的问卷，去发布第一份吧。</p>
      <div v-for="item in list" :key="item.id" class="survey-item">
        <div class="row" style="justify-content: space-between">
          <strong>{{ item.title }}</strong>
          <span class="badge">+{{ item.reward_points }} 积分</span>
        </div>
        <p class="muted">
          {{ item.publisher_nickname || '同学' }} · 进度 {{ item.filled_count }}/{{ item.target_count }}
        </p>
        <p v-if="item.description">{{ item.description }}</p>
        <div class="row">
          <a class="btn ghost" :href="item.link" target="_blank" rel="noopener">打开问卷</a>
          <button
            class="btn"
            :disabled="completingId === item.id || item.publisher_id === myId"
            @click="onComplete(item.id)"
          >
            {{ item.publisher_id === myId ? '我发布的' : completingId === item.id ? '提交中…' : '我已完成' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { completeSurvey, listSurveys } from '@/services/survey'
import { fetchMe } from '@/services/auth'
import { useUserStore } from '@/stores/user'
import type { Survey } from '@/types/api'

const userStore = useUserStore()
const list = ref<Survey[]>([])
const loading = ref(false)
const error = ref('')
const completingId = ref<number | null>(null)
const myId = computed(() => userStore.userInfo?.id)

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!userStore.userInfo) {
      userStore.setUserInfo(await fetchMe())
    }
    list.value = await listSurveys()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function onComplete(id: number) {
  completingId.value = id
  error.value = ''
  try {
    await completeSurvey(id)
    const me = await fetchMe()
    userStore.setUserInfo(me)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '结分失败'
  } finally {
    completingId.value = null
  }
}

onMounted(load)
</script>
