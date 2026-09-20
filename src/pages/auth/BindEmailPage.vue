<template>
  <div class="auth-wrap">
    <div class="card auth-card stack">
      <div class="auth-brand">
        <AppLogo size="lg" />
        <div>
          <h1 class="hero-title">绑定邮箱</h1>
          <p class="muted">请先绑定邮箱后方可继续使用各项功能</p>
        </div>
      </div>

      <div class="field">
        <label>邮箱</label>
        <div class="row">
          <input v-model="email" type="email" placeholder="your@email.com" class="grow" />
          <button
            class="btn btn-sm"
            :disabled="codeSending || !email || countdown > 0"
            @click="onSendCode"
          >
            {{ codeSending ? '发送中…' : countdown > 0 ? `${countdown}秒后重新发送` : codeSent ? '重新发送' : '发送验证码' }}
          </button>
        </div>
      </div>

      <div class="field">
        <label>邮箱验证码</label>
        <div class="row">
          <input v-model="code" placeholder="请输入6位验证码" class="grow" maxlength="6" />
          <button
            class="btn btn-sm"
            :class="{ verified: codeVerified }"
            :disabled="codeVerifying || !code || codeVerified"
            @click="onVerifyCode"
          >
            {{ codeVerifying ? '验证中…' : codeVerified ? '已验证 ✓' : '验证' }}
          </button>
        </div>
        <p v-if="codeSent" class="hint">验证码已发送至 {{ email }}，请查收</p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">邮箱绑定成功！正在跳转…</p>

      <button class="btn" :disabled="binding || !codeVerified" @click="onBind">
        {{ binding ? '绑定中…' : '绑定邮箱并进入' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '@/components/AppLogo.vue'
import { bindEmail, sendEmailCode, verifyEmailCode } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const code = ref('')
const codeSending = ref(false)
const codeSent = ref(false)
const codeVerifying = ref(false)
const codeVerified = ref(false)
const countdown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null
const binding = ref(false)
const error = ref('')
const success = ref(false)

watch(email, () => {
  codeVerified.value = false
  codeSent.value = false
  code.value = ''
  countdown.value = 0
  if (cooldownTimer !== null) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
})

onUnmounted(() => {
  if (cooldownTimer !== null) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
})

function startCooldown(seconds: number) {
  countdown.value = seconds
  if (cooldownTimer !== null) {
    clearInterval(cooldownTimer)
  }
  cooldownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 0
      if (cooldownTimer !== null) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }
  }, 1000)
}

async function onSendCode() {
  error.value = ''
  if (!email.value.trim()) {
    error.value = '请输入邮箱地址'
    return
  }
  if (!email.value.includes('@') || !email.value.includes('.')) {
    error.value = '邮箱格式不正确'
    return
  }
  codeSending.value = true
  try {
    await sendEmailCode(email.value.trim())
    codeSent.value = true
    codeVerified.value = false
    code.value = ''
    error.value = ''
    startCooldown(60)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '发送失败'
  } finally {
    codeSending.value = false
  }
}

async function onVerifyCode() {
  error.value = ''
  if (!code.value.trim()) {
    error.value = '请输入验证码'
    return
  }
  codeVerifying.value = true
  try {
    await verifyEmailCode(email.value.trim(), code.value.trim())
    codeVerified.value = true
    error.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '验证失败'
  } finally {
    codeVerifying.value = false
  }
}

async function onBind() {
  error.value = ''
  if (!email.value.trim()) {
    error.value = '请输入邮箱'
    return
  }
  if (!codeVerified.value) {
    error.value = '请先完成邮箱验证'
    return
  }
  binding.value = true
  try {
    const user = await bindEmail(email.value.trim())
    userStore.setUserInfo(user)
    success.value = true
    setTimeout(() => {
      router.replace('/home')
    }, 1000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '绑定失败'
  } finally {
    binding.value = false
  }
}
</script>

<style scoped>
.success {
  color: #16a34a;
  font-size: 0.875rem;
}
</style>