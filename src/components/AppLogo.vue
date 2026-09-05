<template>
  <img
    class="app-logo"
    :class="[`size-${size}`, { mark: markOnly }]"
    :src="src"
    alt="问而帮"
    decoding="async"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    markOnly?: boolean
  }>(),
  {
    size: 'md',
    markOnly: false,
  },
)

const src = '/logo.png'
</script>

<style scoped>
.app-logo {
  display: block;
  object-fit: contain;
  flex-shrink: 0;
  user-select: none;
}
.size-sm {
  width: 28px;
  height: 28px;
}
.size-md {
  width: 40px;
  height: 40px;
}
.size-lg {
  width: 88px;
  height: 88px;
}
.mark {
  border-radius: 12px;
}
</style>
