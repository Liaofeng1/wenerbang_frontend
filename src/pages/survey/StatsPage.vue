<template>
  <div class="card stack">
    <div class="row" style="justify-content: space-between">
      <div>
        <button class="linkish" @click="$router.push('/survey/mine')">← 我的问卷</button>
        <h1 class="hero-title">{{ stats?.title || '填写人统计' }}</h1>
        <p class="muted">
          进度 {{ stats?.filled_count ?? '-' }}/{{ stats?.target_count ?? '-' }} ·
          {{ stats?.status === 'open' ? '进行中' : '已结束' }} · 平均离开
          {{ avgAway }} 秒 · Tmin {{ stats?.min_fill_seconds ?? '-' }} 秒
        </p>
      </div>
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">加载中…</p>

    <template v-if="stats && !loading">
      <div class="stack">
        <h2>画像占比</h2>
        <div class="stat-block">
          <strong>性别</strong>
          <p class="muted">{{ formatCounts(stats.gender_counts) }}</p>
        </div>
        <div class="stat-block">
          <strong>南北方</strong>
          <p class="muted">{{ formatCounts(stats.region_counts) }}</p>
        </div>
        <div class="stat-block">
          <strong>城市线级</strong>
          <p class="muted">{{ formatCounts(stats.city_tier_counts) }}</p>
        </div>
      </div>

      <div class="stack">
        <h2>填写明细</h2>
        <p v-if="!stats.completions.length" class="muted">还没有人填写。</p>
        <div v-for="(row, idx) in stats.completions" :key="row.user_id + '-' + idx" class="survey-item">
          <div class="row" style="justify-content: space-between">
            <strong>{{ row.nickname || `用户 #${row.user_id}` }}</strong>
            <span class="badge">离开 {{ row.away_seconds }} 秒</span>
          </div>
          <p class="muted">
            {{ row.gender }} · {{ row.region }} · {{ row.city_tier }}
          </p>
          <p class="muted">
            {{ row.school || '未填学校' }} · {{ formatTime(row.completed_at) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSurveyStats } from '@/services/survey'
import type { SurveyStats } from '@/types/api'

const route = useRoute()
const stats = ref<SurveyStats | null>(null)
const loading = ref(false)
const error = ref('')

const avgAway = computed(() => {
  if (!stats.value) return '-'
  return Math.round(stats.value.avg_away_seconds * 10) / 10
})

function formatCounts(map?: Record<string, number>) {
  if (!map || !Object.keys(map).length) return '暂无'
  return Object.entries(map)
    .map(([k, v]) => `${k} ${v}人`)
    .join(' · ')
}

function formatTime(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    stats.value = await getSurveyStats(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.stat-block {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
h2 {
  margin: 8px 0 0;
  font-size: 1.05rem;
}
</style>
