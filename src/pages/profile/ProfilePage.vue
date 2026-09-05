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

      <div v-if="banActive" class="mod-banner ban">
        <strong>账号已封禁</strong>
        <p>因被有效举报满 3 次，已封禁至 {{ formatBan(user?.banned_until) }}。封禁期间不能发问卷、不能填问卷；到期后自动解封并清零警告。</p>
      </div>
      <div v-else-if="(user?.warn_count || 0) > 0" class="mod-banner warn">
        <strong>你已被有效举报</strong>
        <p>
          发布者举报你乱填，且系统核验填写时长远低于或远高于参考平均，已记警告
          <b>{{ user?.warn_count }}</b>/3。
          再被有效举报 {{ Math.max(0, 3 - (user?.warn_count || 0)) }} 次将封禁两周。
        </p>
        <p class="mod-note">时长正常的举报无效，不会增加警告。</p>
      </div>

      <div class="level-box stack">
        <div class="row" style="justify-content: space-between; align-items: baseline">
          <div>
            <strong>Lv.{{ user?.level ?? 1 }} {{ user?.level_title || '问卷萌新' }}</strong>
            <p class="muted" style="margin: 4px 0 0">经验 {{ user?.exp ?? 0 }}
              <template v-if="!user?.level_at_max"> · 距下一级还差 {{ user?.exp_to_next ?? '-' }}</template>
              <template v-else> · 已满级</template>
            </p>
          </div>
          <button
            class="btn secondary"
            type="button"
            :disabled="checkingIn || user?.checked_in_today"
            @click="onCheckIn"
          >
            {{
              checkingIn
                ? '签到中…'
                : user?.checked_in_today
                  ? '今日已签到'
                  : '每日签到 +5经验 / +10积分'
            }}
          </button>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" :style="{ width: `${Math.min(user?.level_progress_pct ?? 0, 100)}%` }" />
        </div>
        <p class="hint">
          签到：+5 经验且 +10 积分；填卷 +10 经验；发卷 +30 经验。积分用于发卷消费，经验用于等级权益。
          置顶折扣 {{ user?.pin_discount_pct ?? 100 }}% · 精准投放折扣 {{ user?.target_discount_pct ?? 100 }}% ·
          本月免费置顶剩余 {{ user?.free_pin_remain ?? 0 }} 次
        </p>
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
          分享下方链接或让好友扫码。对方打开后会进入「邀请注册」页；注册成功后你们各得 50 积分（对方另有注册赠送 30）。
        </p>

        <div class="qr-wrap">
          <img v-if="qrSrc" class="qr-img" :src="qrSrc" alt="邀请二维码" />
          <div v-else class="qr-placeholder muted">生成二维码中…</div>
        </div>

        <div class="field">
          <label>分享用网站地址（手机扫码请填电脑局域网 IP）</label>
          <input
            v-model="shareBase"
            placeholder="例如 http://192.168.1.8:5173"
            @change="rebuildQr"
            @blur="rebuildQr"
          />
        </div>

        <div class="field">
          <label>邀请链接（点击可打开邀请注册页）</label>
          <a
            v-if="inviteUrl"
            class="invite-link"
            :href="inviteUrl"
            target="_blank"
            rel="noopener noreferrer"
          >{{ inviteUrl }}</a>
          <p v-else class="muted">加载中…</p>
        </div>

        <div class="row">
          <button class="btn" type="button" :disabled="!inviteUrl" @click="copyLink">
            {{ copied ? '已复制 ✓' : '一键复制邀请链接' }}
          </button>
          <button class="btn secondary" type="button" :disabled="!inviteUrl" @click="openInviteRegister">
            打开邀请注册页
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
import { fetchMe, updateMe, checkIn } from '@/services/auth'
import { listMyCompletions } from '@/services/survey'
import { useUserStore } from '@/stores/user'
import type { Completion } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)

const banActive = computed(() => {
  const until = user.value?.banned_until
  if (!until) return false
  const t = new Date(until).getTime()
  return !Number.isNaN(t) && t > Date.now()
})

function formatBan(iso?: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

const disciplines = ACADEMIC_DISCIPLINES
const completions = ref<Completion[]>([])
const loading = ref(false)
const saving = ref(false)
const checkingIn = ref(false)
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

async function onCheckIn() {
  checkingIn.value = true
  error.value = ''
  try {
    userStore.setUserInfo(await checkIn())
  } catch (e) {
    error.value = e instanceof Error ? e.message : '签到失败'
  } finally {
    checkingIn.value = false
  }
}

async function copyLink() {
  const text = inviteUrl.value
  if (!text) return
  let done = false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      done = true
    }
  } catch {
    /* fallback below */
  }
  if (!done) {
    const input = document.createElement('textarea')
    input.value = text
    input.setAttribute('readonly', 'true')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, text.length)
    try {
      done = document.execCommand('copy')
    } catch {
      done = false
    }
    document.body.removeChild(input)
  }
  if (!done) {
    error.value = '复制失败，请长按链接手动复制'
    return
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}

function openInviteRegister() {
  const code = user.value?.invite_code
  if (!code) return
  // Same-origin preview via router so invite landing always works
  const resolved = router.resolve({
    name: 'register',
    query: { invite: code },
  })
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
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
.level-box {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 125, 90, 0.08), rgba(46, 125, 90, 0.02));
  border: 1px solid rgba(46, 125, 90, 0.15);
}
.xp-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.xp-fill {
  height: 100%;
  border-radius: 999px;
  background: #2e7d5a;
  transition: width 0.35s ease;
}
.mod-banner {
  padding: 12px 14px;
  border-radius: 12px;
  line-height: 1.45;
}
.mod-banner strong {
  display: block;
  margin-bottom: 4px;
}
.mod-banner p {
  margin: 0;
  font-size: 0.92rem;
}
.mod-banner .mod-note {
  margin-top: 6px;
  opacity: 0.85;
  font-size: 0.85rem;
}
.mod-banner.warn {
  background: #fff6e5;
  color: #7a4d00;
  border: 1px solid #f0d9a8;
}
.mod-banner.ban {
  background: #fdecea;
  color: #8a1f11;
  border: 1px solid #f0b4aa;
}
</style>
