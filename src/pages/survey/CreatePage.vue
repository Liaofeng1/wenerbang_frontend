<template>
  <div class="card stack">
    <div>
      <h1 class="hero-title">发布问卷</h1>
      <p class="muted">
        发布免费。填写奖励由平台按停留时长结算；若设置前 n 份悬赏，将从你的余额冻结对应积分并转移给填写者。
      </p>
      <p class="muted">当前余额：{{ points }}</p>
    </div>
    <div class="field">
      <label>标题</label>
      <input v-model="title" placeholder="例如：大学生消费习惯调查" />
    </div>
    <div class="field">
      <label>问卷链接（问卷星 / 腾讯问卷等）</label>
      <input v-model="link" placeholder="https://" />
    </div>
    <div class="field">
      <label>简介（可选）</label>
      <textarea v-model="description" rows="3" placeholder="大约几分钟、适用人群等" />
    </div>
    <div class="row">
      <div class="field" style="flex: 1">
        <label>目标份数</label>
        <input v-model.number="targetCount" type="number" min="1" />
      </div>
      <div class="field" style="flex: 1">
        <label>最低停留 Tmin（秒）</label>
        <input v-model.number="minFillSeconds" type="number" min="10" />
      </div>
    </div>
    <div class="field">
      <label>预计填写时长（秒）</label>
      <input v-model.number="expectedFillSeconds" type="number" min="10" />
      <p class="hint">
        无人填写前按此估算：大家平均约这么久填完，最高可获 {{ peakHint }} 积分（真实平均会随填写动态更新）。
      </p>
    </div>
    <div class="row">
      <div class="field" style="flex: 1">
        <label>前 n 份悬赏（可 0）</label>
        <input v-model.number="bountyCount" type="number" min="0" />
      </div>
      <div class="field" style="flex: 1">
        <label>每份悬赏积分</label>
        <input v-model.number="bountyPer" type="number" min="0" />
      </div>
    </div>
    <p v-if="freeze > 0" class="muted">将冻结悬赏 {{ freeze }} 积分，未用完的会在问卷结束后退回。</p>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="btn" :disabled="loading" @click="onSubmit">
      {{ loading ? '发布中…' : freeze > 0 ? `发布并冻结 ${freeze} 积分` : '发布问卷' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createSurvey } from '@/services/survey'
import { fetchMe } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const title = ref('')
const link = ref('')
const description = ref('')
const targetCount = ref(10)
const minFillSeconds = ref(120)
const expectedFillSeconds = ref(300)
const bountyCount = ref(0)
const bountyPer = ref(0)
const loading = ref(false)
const error = ref('')

const points = computed(() => userStore.userInfo?.points ?? 0)
const freeze = computed(() => {
  const n = Number(bountyCount.value) || 0
  const p = Number(bountyPer.value) || 0
  if (n <= 0 || p <= 0) return 0
  return n * p
})
const peakHint = computed(() => {
  const t = Number(expectedFillSeconds.value) || 0
  if (t <= 0) return 0
  return Math.round((10 * t) / 60)
})

onMounted(async () => {
  try {
    userStore.setUserInfo(await fetchMe())
  } catch {
    /* ignore */
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await createSurvey({
      title: title.value.trim(),
      link: link.value.trim(),
      description: description.value.trim(),
      target_count: Number(targetCount.value),
      min_fill_seconds: Number(minFillSeconds.value),
      expected_fill_seconds: Number(expectedFillSeconds.value),
      bounty_count: Number(bountyCount.value) || 0,
      bounty_per: Number(bountyPer.value) || 0,
    })
    userStore.setUserInfo(await fetchMe())
    await router.push('/survey/mine')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '发布失败'
  } finally {
    loading.value = false
  }
}
</script>
