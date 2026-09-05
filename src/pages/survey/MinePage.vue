<template>
  <div class="card stack">
    <div class="row" style="justify-content: space-between">
      <div>
        <h1 class="hero-title">我的问卷</h1>
        <p class="muted">查看发布进度；结束后也可查看填写人画像与时长</p>
      </div>
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && !list.length" class="muted">你还没有发布过问卷。</p>
    <div v-for="item in list" :key="item.id" class="survey-item">
      <div class="row" style="justify-content: space-between">
        <strong>
          <span v-if="item.is_pinned" class="pin-tag">置顶</span>
          {{ item.title }}
        </strong>
        <span class="badge" :class="{ closed: item.status !== 'open' }">
          {{ item.status === 'open' ? '进行中' : '已结束' }}
        </span>
      </div>
      <p class="muted">
        进度 {{ item.filled_count }}/{{ item.target_count }} · Tmin {{ item.min_fill_seconds || 120 }} 秒
      </p>
      <p v-if="item.expires_at" class="muted">计划下架：{{ formatExpire(item.expires_at) }}（{{ item.shelf_days }} 天）</p>
      <p class="muted">{{ formatAudience(item) }}</p>
      <p class="reward-line">
        大家平均约 {{ avgText(item) }} 填完，最高可获 {{ item.estimated_reward || item.reward_points || 0 }} 积分
      </p>
      <p v-if="item.bounty_count > 0" class="muted">
        悬赏 前 {{ item.bounty_count }} 份 × {{ item.bounty_per }}，剩余 {{ item.bounty_remain }} 份
        <template v-if="item.pin_by_bounty"> · 奖池置顶中</template>
      </p>
      <p v-if="item.pin_by_paid" class="muted">付费置顶 {{ item.pin_hours }}h，至 {{ formatPin(item.pin_until) }}</p>
      <p v-if="item.target_audience_count > 0" class="muted">
        定向 {{ item.target_audience_count }} 人（×5 积分）· 已触达 {{ item.targeting_reached }}/{{
          item.target_audience_count * 2
        }}
        <template v-if="item.target_school"> · {{ item.target_school }}</template>
        <template v-if="item.target_major"> · {{ item.target_major }}</template>
        <template v-if="item.target_gender"> · {{ item.target_gender }}</template>
      </p>
      <div class="row">
        <a class="linkish" :href="item.link" target="_blank" rel="noopener">打开问卷链接</a>
        <button class="btn ghost" @click="$router.push(`/survey/${item.id}/stats`)">
          填写人统计
        </button>
        <button
          v-if="item.status === 'open'"
          class="btn ghost"
          type="button"
          :disabled="stoppingId === item.id"
          @click="onStop(item)"
        >
          {{ stoppingId === item.id ? '停止中…' : '停止问卷' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { closeSurvey, listMySurveys } from '@/services/survey'
import type { Survey } from '@/types/api'

const list = ref<Survey[]>([])
const loading = ref(false)
const error = ref('')
const stoppingId = ref<number | null>(null)

function formatExpire(iso?: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function part(label: string, tags?: string[]) {
  if (!tags || tags.length === 0) return `${label}不限`
  return `${label}${tags.join('、')}`
}

function formatAudience(item: Survey) {
  return [
    part('性别：', item.target_genders),
    part('南北：', item.target_regions),
    part('线级：', item.target_city_tiers),
  ].join(' · ')
}

function avgText(item: Survey) {
  const s = item.avg_fill_seconds || item.expected_fill_seconds || 300
  if (s < 60) return `${s} 秒`
  const minutes = Math.round((s / 60) * 10) / 10
  return `${minutes} 分钟`
}

function formatPin(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
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

async function onStop(item: Survey) {
  if (item.status !== 'open') return
  if (!window.confirm(`确定停止「${item.title}」？停止后大厅不再展示，未发出的悬赏积分将退回。`)) {
    return
  }
  stoppingId.value = item.id
  error.value = ''
  try {
    const updated = await closeSurvey(item.id)
    const idx = list.value.findIndex((s) => s.id === item.id)
    if (idx >= 0) {
      list.value[idx] = updated
    } else {
      await load()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '停止失败'
  } finally {
    stoppingId.value = null
  }
}

onMounted(load)
</script>
