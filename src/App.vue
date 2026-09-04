<template>
  <div class="app-shell">
    <header v-if="showNav" class="topbar">
      <div class="brand" @click="$router.push('/home')">问而帮</div>
      <nav class="nav">
        <RouterLink to="/home">大厅</RouterLink>
        <RouterLink to="/survey/create">发布</RouterLink>
        <RouterLink to="/survey/mine">我的问卷</RouterLink>
        <RouterLink to="/profile">我的</RouterLink>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => !route.meta.hideNav)
</script>
