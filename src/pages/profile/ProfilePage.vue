<template>
  <div class="stack">
    <div class="card stack">
      <div class="row" style="justify-content: space-between">
        <div>
          <h1 class="hero-title">{{ user?.nickname || user?.username || '我的' }}</h1>
          <p class="muted">
            {{ user?.school || '未填写学校' }}
            · {{ user?.gender || '未选性别' }}
            · {{ user?.region || '未选南北' }}/{{ user?.city_tier || '未选线级' }}
          </p>
          <p class="muted">@{{ user?.username }}</p>
        </div>
        <button class="btn ghost" @click="onLogout">退出登录</button>
      </div>
      <div>
        <div class="muted">当前积分</div>
        <div class="points">{{ user?.points ?? '-' }}</div>
      </div>

      <div class="invite-box">
        <div class="muted">我的邀请链接</div>
        <p class="hint">
          分享链接或让好友扫码，打开后直接进入注册页；对方注册成功，你们各得 50 积分（对方另有注册赠送 30）。
        </p>

        <div class="qr-wrap">
          <img v-if="qrSrc" class="qr-img" :src="qrSrc" alt="邀请二维码" />
          <div v-else class="qr-placeholder muted">生成二维码中…</div>
        </div>

        <div class="field">
          <label>分享用网站地址（手机扫码请填电脑局域网 IP）</label>
          <input v-model="shareBase" placeholder="例如 http://192.168.1.8:5173" @change="rebuildQr" @blur="rebuildQr" />
        </div>

        <div class="field">
          <label>邀请链接</label>
          <input :value="inviteUrl" readonly />
        </div>

        <div class="row">
          <button class="btn" type="button" :disabled="!inviteUrl" @click="copyLink">
            {{ copied ? '已复制链接' : '复制邀请链接' }}
          </button>
        </div>
        <p class="hint">
          同一 WiFi 下，运行 <code>ipconfig</code> 查看 IPv4，把地址改成
          <code>http://你的IP:5173</code> 后再扫码。
        </p>
      </div>

      <button class="btn secondary" :disabled="loading" @click="refresh">刷新资料</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="card stack">
      <h2>我填写过的</h2>
      <p v-if="!completions.length" class="muted">还没有填写记录。</p>
      <div v-for="item in completions" :key="item.id" class="survey-item">
        <div class="row" style="justify-content: space-between">
          <strong>{{ item.survey_title || `问卷 #${item.survey_id}` }}</strong>
          <span class="badge">+{{ item.points_earned }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { fetchMe } from '@/services/auth'
import { listMyCompletions } from '@/services/survey'
import { useUserStore } from '@/stores/user'
import type { Completion } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
const completions = ref<Completion[]>([])
const loading = ref(false)
const error = ref('')
const copied = ref(false)
const shareBase = ref(typeof window !== 'undefined' ? window.location.origin : '')
const qrSrc = ref('')

const inviteUrl = computed(() => {
  const code = user.value?.invite_code
  if (!code) return ''
  const base = shareBase.value.replace(/\/$/, '')
  return `${base}/register?invite=${encodeURIComponent(code)}`
})

async function rebuildQr() {
  const url = inviteUrl.value
  if (!url) {
    qrSrc.value = ''
    return
  }
  try {
    qrSrc.value = await QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: { dark: '#1a2e24', light: '#ffffff' },
    })
  } catch {
    qrSrc.value = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`
  }
}

async function refresh() {
  loading.value = true
  error.value = ''
  try {
    userStore.setUserInfo(await fetchMe())
    completions.value = await listMyCompletions()
    await rebuildQr()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  const text = inviteUrl.value
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}

function onLogout() {
  userStore.logout()
  router.push('/login')
}

watch(inviteUrl, () => {
  void rebuildQr()
})

onMounted(refresh)
</script>
