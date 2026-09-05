<template>
  <div class="auth-wrap">
    <div class="card auth-card stack">
      <div>
        <h1 class="hero-title">注册问而帮</h1>
        <p class="muted">完善资料后赠送 30 积分</p>
        <p v-if="fromInvite" class="invite-banner">
          你正在通过好友邀请注册，成功后双方各再得 50 积分
        </p>
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
        <input v-model="school" placeholder="默认：中国人民大学" />
      </div>
      <div class="field">
        <label>专业（学科门类，必选）</label>
        <select v-model="major">
          <option value="" disabled>请选择学科门类</option>
          <option v-for="d in disciplines" :key="d" :value="d">{{ d }}</option>
        </select>
        <p class="hint">与分类投放一致：哲学、经济学、法学…共 13 个门类</p>
      </div>
      <div class="field">
        <label>性别（必选）</label>
        <div class="chip-grid">
          <button
            v-for="g in GENDERS"
            :key="g"
            type="button"
            class="chip"
            :class="{ active: gender === g }"
            @click="gender = g"
          >
            {{ g }}
          </button>
        </div>
      </div>
      <div class="field">
        <label>城市所在（南北方，必选）</label>
        <div class="chip-grid">
          <button
            v-for="r in REGIONS"
            :key="r"
            type="button"
            class="chip"
            :class="{ active: region === r }"
            @click="region = r"
          >
            {{ r }}
          </button>
        </div>
      </div>
      <div class="field">
        <label>城市线级（必选）</label>
        <div class="chip-grid">
          <button
            v-for="t in CITY_TIERS"
            :key="t"
            type="button"
            class="chip"
            :class="{ active: cityTier === t }"
            @click="cityTier = t"
          >
            {{ t }}
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ACADEMIC_DISCIPLINES } from '@/constants/disciplines'
import { CITY_TIERS, GENDERS, REGIONS } from '@/constants/profile'
import { register } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const disciplines = ACADEMIC_DISCIPLINES

const username = ref('')
const password = ref('')
const nickname = ref('')
const school = ref('中国人民大学')
const major = ref('')
const gender = ref('')
const region = ref('')
const cityTier = ref('')
const inviteToken = ref('')
const loading = ref(false)
const error = ref('')

const fromInvite = computed(() => Boolean(inviteToken.value))

onMounted(() => {
  const q = route.query.invite
  if (typeof q === 'string' && q.trim()) {
    inviteToken.value = q.trim()
  }
})

async function onSubmit() {
  error.value = ''
  if (!major.value) {
    error.value = '请选择专业学科门类'
    return
  }
  if (!gender.value || !region.value || !cityTier.value) {
    error.value = '请完善性别、南北方与城市线级'
    return
  }
  loading.value = true
  try {
    const res = await register({
      username: username.value.trim(),
      password: password.value,
      nickname: nickname.value.trim(),
      school: school.value.trim(),
      major: major.value.trim(),
      gender: gender.value,
      region: region.value,
      city_tier: cityTier.value,
      invite_code: inviteToken.value,
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
