<template>
  <div class="auth-wrap">
    <div class="card auth-card stack">
      <div>
        <h1 class="hero-title">登录问而帮</h1>
        <p class="muted">用积分互助，把问卷发到真正愿意填的人手里</p>
      </div>
      <div class="field">
        <label>用户名</label>
        <input v-model="username" autocomplete="username" />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" @keyup.enter="onSubmit" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn" :disabled="loading" @click="onSubmit">
        {{ loading ? '登录中…' : '登录' }}
      </button>
      <p class="muted">
        还没有账号？
        <button class="linkish" @click="$router.push('/register')">去注册（送 20 积分）</button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await login({ username: username.value.trim(), password: password.value })
    userStore.setAuth(res.token, res.user)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
