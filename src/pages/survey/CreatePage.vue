<template>
  <div class="card stack">
    <div>
      <h1 class="hero-title">发布问卷</h1>
      <p class="muted">
        基础发布费 150 积分（沉没成本）。可选悬赏 / 置顶 / 分类投放；填写奖励仍由平台按时长结算。
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
        无人填写前按此估算：大家平均约这么久填完，最高可获 {{ peakHint }} 积分。
      </p>
    </div>
    <div class="field">
      <label>多少天后下架（必填）</label>
      <input v-model.number="shelfDays" type="number" min="1" max="60" step="1" />
      <p class="hint">以天为单位，最少 1 天，最长 60 天。到期后问卷自动下架，大厅不再展示。</p>
    </div>

    <div class="field">
      <label>额外激励（悬赏，可选）</label>
      <p class="hint">开启后：至少前 50 份、每份至少 10 积分；奖池未用完期间自动置顶，用完取消。</p>
      <div class="row">
        <div class="field" style="flex: 1">
          <label>前 n 份（0=不设）</label>
          <input v-model.number="bountyCount" type="number" min="0" step="1" />
        </div>
        <div class="field" style="flex: 1">
          <label>每份悬赏积分</label>
          <input v-model.number="bountyPer" type="number" min="0" step="1" />
        </div>
      </div>
    </div>

    <div class="field">
      <label>购买置顶</label>
      <p class="hint">30 积分 / 小时，可选 4 / 6 / 8 小时（与悬赏置顶可叠加）。</p>
      <div class="row">
        <button
          v-for="h in pinOptions"
          :key="h"
          type="button"
          class="chip"
          :class="{ active: pinHours === h }"
          @click="pinHours = h"
        >
          {{ h === 0 ? '不置顶' : `${h}h · ${h * 30} 分` }}
        </button>
      </div>
    </div>

    <div class="field">
      <label>分类投放（可选）</label>
      <p class="hint">按学校 / 学科门类 / 性别定向；费用 = 要求人数 × 5；投放给画像匹配用户，上限为要求人数的 200%。</p>
      <div class="row">
        <div class="field" style="flex: 1">
          <label>目标学校</label>
          <input v-model="targetSchool" placeholder="如：中国人民大学" />
        </div>
        <div class="field" style="flex: 1">
          <label>目标专业（学科门类）</label>
          <select v-model="targetMajor">
            <option value="">不限</option>
            <option v-for="d in disciplines" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex: 1">
          <label>目标性别</label>
          <select v-model="targetGender">
            <option value="">不限</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="field" style="flex: 1">
          <label>要求投放人数</label>
          <input v-model.number="targetAudienceCount" type="number" min="0" />
        </div>
      </div>
    </div>

    <div class="field">
      <label>城市定向（可选）</label>
      <p class="muted" style="font-size: 0.85rem">不选表示不限；与分类投放可同时使用</p>
      <div class="field">
        <label>面向南北方</label>
        <div class="chip-grid">
          <button
            v-for="r in REGIONS"
            :key="r"
            type="button"
            class="chip"
            :class="{ active: regions.includes(r) }"
            @click="toggleRegions(r)"
          >
            {{ r }}
          </button>
        </div>
      </div>
      <div class="field">
        <label>面向城市线级</label>
        <div class="chip-grid">
          <button
            v-for="t in CITY_TIERS"
            :key="t"
            type="button"
            class="chip"
            :class="{ active: cityTiers.includes(t) }"
            @click="toggleCityTiers(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>
    </div>

    <div class="cost-box">
      <div>基础发布：{{ publishCost }}</div>
      <div>悬赏奖池：{{ bountyCost }}</div>
      <div>
        置顶：{{ pinCost }}
        <span v-if="pinHours > 0 && freePinRemain > 0" class="muted">（将使用 1 次免费置顶）</span>
        <span v-else-if="pinDiscount < 100" class="muted">（Lv.{{ level }} {{ pinDiscount }}折）</span>
      </div>
      <div>
        分类投放：{{ targetingCost }}
        <span v-if="targetDiscount < 100" class="muted">（Lv.{{ level }} {{ targetDiscount }}折）</span>
      </div>
      <strong>合计扣除：{{ totalCost }} 积分</strong>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <button class="btn" :disabled="loading || totalCost > points" @click="onSubmit">
      {{ loading ? '发布中…' : `发布并扣除 ${totalCost} 积分` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ACADEMIC_DISCIPLINES } from '@/constants/disciplines'
import { CITY_TIERS, REGIONS } from '@/constants/profile'
import { createSurvey } from '@/services/survey'
import { fetchMe } from '@/services/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const disciplines = ACADEMIC_DISCIPLINES

const title = ref('')
const link = ref('')
const description = ref('')
const targetCount = ref(10)
const minFillSeconds = ref(120)
const expectedFillSeconds = ref(300)
const shelfDays = ref(7)
const bountyCount = ref(0)
const bountyPer = ref(0)
const pinHours = ref(0)
const pinOptions = [0, 4, 6, 8]
const targetSchool = ref('')
const targetMajor = ref('')
const targetGender = ref('')
const targetAudienceCount = ref(0)
const regions = ref<string[]>([])
const cityTiers = ref<string[]>([])
const loading = ref(false)
const error = ref('')

const publishCost = 150
const points = computed(() => userStore.userInfo?.points ?? 0)
const level = computed(() => userStore.userInfo?.level ?? 1)
const pinDiscount = computed(() => userStore.userInfo?.pin_discount_pct ?? 100)
const targetDiscount = computed(() => userStore.userInfo?.target_discount_pct ?? 100)
const freePinRemain = computed(() => userStore.userInfo?.free_pin_remain ?? 0)
const bountyCost = computed(() => {
  const n = Number(bountyCount.value) || 0
  const p = Number(bountyPer.value) || 0
  if (n <= 0 || p <= 0) return 0
  return n * p
})
const pinCost = computed(() => {
  const hours = Number(pinHours.value) || 0
  if (hours <= 0) return 0
  if (freePinRemain.value > 0) return 0
  const raw = hours * 30
  return Math.floor((raw * pinDiscount.value) / 100)
})
const targetingCost = computed(() => {
  const raw = (Number(targetAudienceCount.value) || 0) * 5
  return Math.floor((raw * targetDiscount.value) / 100)
})
const totalCost = computed(() => publishCost + bountyCost.value + pinCost.value + targetingCost.value)
const peakHint = computed(() => {
  const t = Number(expectedFillSeconds.value) || 0
  if (t <= 0) return 0
  return Math.round((10 * t) / 60)
})

function flip(list: { value: string[] }, tag: string) {
  if (list.value.includes(tag)) {
    list.value = list.value.filter((t) => t !== tag)
  } else {
    list.value = [...list.value, tag]
  }
}

function toggleRegions(tag: string) {
  flip(regions, tag)
}
function toggleCityTiers(tag: string) {
  flip(cityTiers, tag)
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
  const shelf = Number(shelfDays.value) || 0
  if (shelf < 1 || shelf > 60) {
    error.value = '下架天数须为 1–60 天'
    return
  }
  const n = Number(bountyCount.value) || 0
  const p = Number(bountyPer.value) || 0
  if (n > 0 && (n < 50 || p < 10)) {
    error.value = '悬赏需至少前 50 份，且每份至少 10 积分'
    return
  }
  const hasFilter = Boolean(targetSchool.value.trim() || targetMajor.value.trim() || targetGender.value)
  const aud = Number(targetAudienceCount.value) || 0
  if (hasFilter && aud <= 0) {
    error.value = '开启分类投放时请填写要求投放人数'
    return
  }
  if (aud > 0 && !hasFilter) {
    error.value = '分类投放请至少填写学校 / 专业 / 性别之一'
    return
  }
  loading.value = true
  try {
    await createSurvey({
      title: title.value.trim(),
      link: link.value.trim(),
      description: description.value.trim(),
      target_count: Number(targetCount.value),
      min_fill_seconds: Number(minFillSeconds.value),
      expected_fill_seconds: Number(expectedFillSeconds.value),
      shelf_days: Number(shelfDays.value) || 0,
      bounty_count: n,
      bounty_per: n > 0 ? p : 0,
      pin_hours: Number(pinHours.value) || 0,
      target_school: targetSchool.value.trim(),
      target_major: targetMajor.value.trim(),
      target_gender: targetGender.value.trim(),
      target_audience_count: aud,
      target_genders: targetGender.value.trim() ? [targetGender.value.trim()] : [],
      target_regions: regions.value,
      target_city_tiers: cityTiers.value,
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

<style scoped>
.chip {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--muted);
}
.chip.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.cost-box {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--ink);
  font-size: 0.92rem;
}
</style>
