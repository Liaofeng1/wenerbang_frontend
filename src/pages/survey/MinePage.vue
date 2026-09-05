<template>
  <div class="card stack">
    <div class="row" style="justify-content: space-between">
      <div>
        <h1 class="hero-title">我的问卷</h1>
        <p class="muted">查看发布进度与状态</p>
      </div>
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && !list.length" class="muted">你还没有发布过问卷。</p>
    <div v-for="item in list" :key="item.id" class="survey-item">
      <div class="row" style="justify-content: space-between">
        <strong>{{ item.title }}</strong>
        <span class="badge" :class="{ closed: item.status !== 'open' }">
          {{ item.status === 'open' ? '进行中' : '已结束' }}
        </span>
      </div>
      <p class="muted">
        进度 {{ item.filled_count }}/{{ item.target_count }} · Tmin {{ item.min_fill_seconds || 120 }} 秒
      </p>
      <p class="reward-line">
        大家平均约 {{ avgText(item) }} 填完，最高可获 {{ item.estimated_reward || item.reward_points || 0 }} 积分
      </p>
      <p v-if="item.bounty_count > 0" class="muted">
        悬赏 前 {{ item.bounty_count }} 份 × {{ item.bounty_per }}，剩余 {{ item.bounty_remain }} 份
      </p>
      <a class="linkish" :href="item.link" target="_blank" rel="noopener">打开问卷链接</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listMySurveys } from '@/services/survey'
import type { Survey } from '@/types/api'

const list = ref<Survey[]>([])
const loading = ref(false)
const error = ref('')

function avgText(item: Survey) {
  const s = item.avg_fill_seconds || item.expected_fill_seconds || 300
  if (s < 60) return `${s} 秒`
  const minutes = Math.round((s / 60) * 10) / 10
  return `${minutes} 分钟`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    list.value = await listMySurveys()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
