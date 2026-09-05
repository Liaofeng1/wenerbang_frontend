<template>
  <div class="auth-wrap">
    <div class="card auth-card stack">
      <div>
        <h1 class="hero-title">注册问而帮</h1>
        <p class="muted">新用户赠送 20 积分，每次发布问卷消耗 5 积分</p>
      </div>
      <div class="field">
        <label>用户名</label>
        <input v-model="username" autocomplete="username" />
      </div>
      <div class="field">
        <label>密码（至少 4 位）</label>
        <input v-model="password" type="password" autocomplete="new-password" />
      </div>
      <div class="field">
        <label>昵称（可选）</label>
        <input v-model="nickname" />
      </div>
      <div class="field">
        <label>学校（可选）</label>
        <input v-model="school" placeholder="如：中国人民大学" />
      </div>
      <div class="field">
        <label>学位类别（必选）</label>
        <p class="muted" style="font-size: 0.85rem">学术型学科门类，不区分本硕博</p>
        <div class="chip-grid">
          <button
            v-for="tag in DEGREE_TAGS"
            :key="tag"
            type="button"
            class="chip"
            :class="{ active: degreeTag === tag }"
            @click="degreeTag = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn" :disabled="loading" @click="onSubmit">
        {{ loading ? '注册中…' : '注册并进入' }}
      </button>
      <p class="muted">
        已有账号？
        <button class="linkish" @click="$router.push('/login')">去登录</button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DEGREE_TAGS } from '@/constants/degrees'
import { register } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const nickname = ref('')
const school = ref('')
const degreeTag = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!degreeTag.value) {
    error.value = '请选择学位类别'
    return
  }
  loading.value = true
  try {
    const res = await register({
      username: username.value.trim(),
      password: password.value,
      nickname: nickname.value.trim(),
      school: school.value.trim(),
      degree_tag: degreeTag.value,
    })
    userStore.setAuth(res.token, res.user)
    await router.replace('/home')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
