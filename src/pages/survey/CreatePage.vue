<template>
  <div class="card stack">
    <div>
      <h1 class="hero-title">发布问卷</h1>
      <p class="muted">
        每次发布固定消耗
        <strong>{{ cost }}</strong>
        积分。当前余额：{{ points }}
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
    <div class="field">
      <label>面向学位类别</label>
      <p class="muted" style="font-size: 0.85rem">
        不选表示不限；勾选后仅对应学科门类学生可填写
      </p>
      <div class="row" style="margin-bottom: 8px">
        <button type="button" class="btn ghost" @click="selectAll">全选</button>
        <button type="button" class="btn ghost" @click="clearAll">清空（不限）</button>
      </div>
      <div class="chip-grid">
        <button
          v-for="tag in DEGREE_TAGS"
          :key="tag"
          type="button"
          class="chip"
          :class="{ active: selected.includes(tag) }"
          @click="toggle(tag)"
        >
          {{ tag }}
        </button>
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
import { DEGREE_TAGS } from '@/constants/degrees'
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
const selected = ref<string[]>([])

const points = computed(() => userStore.userInfo?.points ?? 0)
const cost = 5

function toggle(tag: string) {
  if (selected.value.includes(tag)) {
    selected.value = selected.value.filter((t) => t !== tag)
  } else {
    selected.value = [...selected.value, tag]
  }
}

function selectAll() {
  selected.value = [...DEGREE_TAGS]
}

function clearAll() {
  selected.value = []
}

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
      reward_points: Number(rewardPoints.value),
      target_degrees: selected.value,
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
