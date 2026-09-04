<template>
  <div class="card stack">
    <div>
      <h1 class="hero-title">发布问卷</h1>
      <p class="muted">
        将消耗
        <strong>{{ cost }}</strong>
        积分（目标份数 × 每份奖励）。当前余额：{{ points }}
      </p>
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
        <label>每份奖励积分</label>
        <input v-model.number="rewardPoints" type="number" min="1" />
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="btn" :disabled="loading" @click="onSubmit">
      {{ loading ? '发布中…' : '发布并扣除积分' }}
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
const rewardPoints = ref(2)
const loading = ref(false)
const error = ref('')

const points = computed(() => userStore.userInfo?.points ?? 0)
const cost = computed(() => Math.max(0, Number(targetCount.value) || 0) * Math.max(0, Number(rewardPoints.value) || 0))

onMounted(async () => {
  try {
    userStore.setUserInfo(await fetchMe())
  } catch {
    /* ignore, guard will handle auth */
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
      reward_points: Number(rewardPoints.value),
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
