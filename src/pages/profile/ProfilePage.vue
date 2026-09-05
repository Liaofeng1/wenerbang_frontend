<template>
  <div class="stack">
    <div class="card stack">
      <div class="row" style="justify-content: space-between">
        <div>
          <h1 class="hero-title">{{ user?.nickname || user?.username || '我的' }}</h1>
          <p class="muted">
            {{ user?.school || '未填写学校' }}
            <template v-if="user?.major"> · {{ user.major }}</template>
            <template v-if="user?.gender"> · {{ user.gender }}</template>
            <template v-if="user?.region || user?.city_tier">
              · {{ user?.region || '未选南北' }}/{{ user?.city_tier || '未选线级' }}
            </template>
            · @{{ user?.username }}
          </p>
        </div>
        <button class="btn ghost" @click="onLogout">退出登录</button>
      </div>
      <div>
        <div class="muted">当前积分</div>
        <div class="points">{{ user?.points ?? '-' }}</div>
      </div>

      <div class="profile-block stack">
        <div class="row" style="justify-content: space-between; align-items: center">
          <h2>个人信息</h2>
          <button
            v-if="!editing"
            class="btn secondary"
            type="button"
            @click="startEdit"
          >
            修改个人信息
          </button>
        </div>

        <template v-if="!editing">
          <div class="info-grid">
            <div class="info-row">
              <span class="muted">用户名</span>
              <span>{{ user?.username || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">昵称</span>
              <span>{{ user?.nickname || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">学校</span>
              <span>{{ user?.school || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">专业</span>
              <span>{{ user?.major || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">性别</span>
              <span>{{ user?.gender || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">南北方</span>
              <span>{{ user?.region || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="muted">城市线级</span>
              <span>{{ user?.city_tier || '未填写' }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="hint">用户名不可改；专业请选学术型学科门类。</p>
          <div class="field">
            <label>用户名</label>
            <input :value="user?.username || ''" readonly />
          </div>
          <div class="field">
            <label>昵称</label>
            <input v-model="form.nickname" placeholder="显示名称" />
          </div>
          <div class="field">
            <label>学校</label>
            <input v-model="form.school" placeholder="例如：中国人民大学" />
          </div>
          <div class="field">
            <label>专业（学科门类）</label>
            <select v-model="form.major">
              <option value="">不填</option>
              <option
                v-if="form.major && !(disciplines as readonly string[]).includes(form.major)"
                :value="form.major"
              >
                {{ form.major }}（原填写）
              </option>
              <option v-for="d in disciplines" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="field">
            <label>性别</label>
            <select v-model="form.gender">
              <option value="">不填</option>
              <option v-for="g in GENDERS" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
          <div class="field">
            <label>城市所在（南北方）</label>
            <select v-model="form.region">
              <option value="">不填</option>
              <option v-for="r in REGIONS" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="field">
            <label>城市线级</label>
            <select v-model="form.city_tier">
              <option value="">不填</option>
              <option v-for="t in CITY_TIERS" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="row">
            <button class="btn" type="button" :disabled="saving" @click="onSaveProfile">
              {{ saving ? '保存中…' : '保存' }}
            </button>
            <button class="btn ghost" type="button" :disabled="saving" @click="cancelEdit">
              取消
            </button>
          </div>
        </template>

        <p v-if="saveOk" class="hint" style="color: var(--accent)">已保存</p>
        <p v-if="error" class="error">{{ error }}</p>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { ACADEMIC_DISCIPLINES } from '@/constants/disciplines'
import { CITY_TIERS, GENDERS, REGIONS } from '@/constants/profile'
import { fetchMe, updateMe } from '@/services/auth'
import { listMyCompletions } from '@/services/survey'
import { useUserStore } from '@/stores/user'
import type { Completion } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
const disciplines = ACADEMIC_DISCIPLINES
const completions = ref<Completion[]>([])
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const saveOk = ref(false)
const error = ref('')
const copied = ref(false)
const shareBase = ref(typeof window !== 'undefined' ? window.location.origin : '')
const qrSrc = ref('')

const form = reactive({
  nickname: '',
  school: '',
  major: '',
  gender: '',
  region: '',
  city_tier: '',
})

function syncForm() {
  form.nickname = user.value?.nickname || ''
  form.school = user.value?.school || ''
  form.major = user.value?.major || ''
  form.gender = user.value?.gender || ''
  form.region = user.value?.region || ''
  form.city_tier = user.value?.city_tier || ''
}

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
    syncForm()
    completions.value = await listMyCompletions()
    await rebuildQr()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function startEdit() {
  syncForm()
  error.value = ''
  saveOk.value = false
  editing.value = true
}

function cancelEdit() {
  syncForm()
  error.value = ''
  editing.value = false
}

async function onSaveProfile() {
  saving.value = true
  saveOk.value = false
  error.value = ''
  try {
    const updated = await updateMe({
      nickname: form.nickname.trim(),
      school: form.school.trim(),
      major: form.major.trim(),
      gender: form.gender.trim(),
      region: form.region.trim(),
      city_tier: form.city_tier.trim(),
    })
    userStore.setUserInfo(updated)
    syncForm()
    editing.value = false
    saveOk.value = true
    window.setTimeout(() => {
      saveOk.value = false
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
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

<style scoped>
.profile-block {
  padding-top: 4px;
  border-top: 1px solid var(--line);
}
.profile-block h2 {
  font-size: 1.1rem;
  margin: 0;
}
.info-grid {
  display: grid;
  gap: 10px;
}
.info-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: baseline;
}
</style>
