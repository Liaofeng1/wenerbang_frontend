<template>
  <div class="stack">
    <div class="card stack">
      <div class="row" style="justify-content: space-between">
        <div>
          <h1 class="hero-title">问卷大厅</h1>
          <p class="muted">
            填写他人问卷赚积分。需离开本站填写满 {{ minAwaySeconds }} 秒后才能提交，防止秒填。
          </p>
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
        <p class="muted">
          面向：{{ formatTargets(item.target_degrees) }}
        </p>
        <p v-if="item.description">{{ item.description }}</p>
        <p v-if="item.publisher_id !== myId" class="muted">
          {{ statusText(item.id) }}
        </p>
        <div class="row">
          <button
            class="btn ghost"
            :disabled="item.publisher_id === myId || openingId === item.id"
            @click="onOpen(item)"
          >
            {{ openingId === item.id ? '打开中…' : '打开问卷' }}
          </button>
          <button
            class="btn"
            :disabled="
              completingId === item.id ||
              item.publisher_id === myId ||
              !canComplete(item.id)
            "
            @click="onComplete(item.id)"
          >
            {{
              item.publisher_id === myId
                ? '我发布的'
                : completingId === item.id
                  ? '提交中…'
                  : '我已完成'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  completeSurvey,
  leaveSurvey,
  listSurveys,
  returnSurvey,
  startSurvey,
} from '@/services/survey'
import { fetchMe } from '@/services/auth'
import { useUserStore } from '@/stores/user'
import type { Survey } from '@/types/api'

const userStore = useUserStore()
const list = ref<Survey[]>([])
const loading = ref(false)
const error = ref('')
const completingId = ref<number | null>(null)
const openingId = ref<number | null>(null)
const myId = computed(() => userStore.userInfo?.id)
const minAwaySeconds = ref(30)

function formatTargets(tags?: string[]) {
  if (!tags || tags.length === 0) return '不限学位'
  return tags.join('、')
}

/** Local UI state for leave/return timing per survey */
const tracking = reactive<
  Record<
    number,
    {
      started: boolean
      awaySeconds: number
      ready: boolean
      away: boolean
    }
  >
>({})

let activeSurveyId: number | null = null
let pollTimer: number | null = null

function ensureTrack(id: number) {
  if (!tracking[id]) {
    tracking[id] = { started: false, awaySeconds: 0, ready: false, away: false }
  }
  return tracking[id]
}

function canComplete(id: number) {
  const t = tracking[id]
  return Boolean(t?.started && t.ready)
}

function statusText(id: number) {
  const t = tracking[id]
  if (!t?.started) return `请先打开问卷，离开本页填写满 ${minAwaySeconds.value} 秒`
  if (t.away) return `填写中…已离开 ${t.awaySeconds} 秒（需满 ${minAwaySeconds.value} 秒）`
  if (t.ready) return `已离开累计 ${t.awaySeconds} 秒，可以提交`
  return `已离开累计 ${t.awaySeconds} / ${minAwaySeconds.value} 秒，请继续填写`
}

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

async function onOpen(item: Survey) {
  openingId.value = item.id
  error.value = ''
  try {
    const session = await startSurvey(item.id)
    minAwaySeconds.value = session.min_away_seconds
    const t = ensureTrack(item.id)
    t.started = true
    t.awaySeconds = session.away_seconds
    t.ready = session.ready
    activeSurveyId = item.id
    window.open(item.link, '_blank', 'noopener,noreferrer')
    // If browser already hid this page, record leave soon.
    if (document.visibilityState === 'hidden') {
      await markLeave(item.id)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '打开失败'
  } finally {
    openingId.value = null
  }
}

async function markLeave(id: number) {
  try {
    const session = await leaveSurvey(id)
    minAwaySeconds.value = session.min_away_seconds
    const t = ensureTrack(id)
    t.started = true
    t.away = true
    t.awaySeconds = session.away_seconds
    t.ready = session.ready
    startPolling(id)
  } catch {
    /* ignore transient */
  }
}

async function markReturn(id: number) {
  stopPolling()
  try {
    const session = await returnSurvey(id)
    minAwaySeconds.value = session.min_away_seconds
    const t = ensureTrack(id)
    t.started = true
    t.away = false
    t.awaySeconds = session.away_seconds
    t.ready = session.ready
  } catch (e) {
    error.value = e instanceof Error ? e.message : '回站同步失败'
  }
}

function startPolling(id: number) {
  stopPolling()
  pollTimer = window.setInterval(() => {
    const t = tracking[id]
    if (!t?.away) return
    t.awaySeconds += 1
    t.ready = t.awaySeconds >= minAwaySeconds.value
  }, 1000)
}

function stopPolling() {
  if (pollTimer != null) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
}

async function onVisibility() {
  if (activeSurveyId == null) return
  const id = activeSurveyId
  if (document.visibilityState === 'hidden') {
    await markLeave(id)
  } else if (document.visibilityState === 'visible') {
    await markReturn(id)
  }
}

async function onComplete(id: number) {
  completingId.value = id
  error.value = ''
  try {
    // If still marked away, close interval first.
    if (tracking[id]?.away) {
      await markReturn(id)
    }
    await completeSurvey(id)
    const t = ensureTrack(id)
    t.started = false
    t.ready = false
    t.awaySeconds = 0
    t.away = false
    if (activeSurveyId === id) activeSurveyId = null
    const me = await fetchMe()
    userStore.setUserInfo(me)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '结分失败'
  } finally {
    completingId.value = null
  }
}

onMounted(() => {
  load()
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  stopPolling()
})
</script>
