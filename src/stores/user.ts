import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/api'

const TOKEN_KEY = 'wenbang_token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)

  function setAuth(newToken: string, user: UserInfo) {
    token.value = newToken
    userInfo.value = user
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function setUserInfo(user: UserInfo) {
    userInfo.value = user
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, userInfo, setAuth, setUserInfo, logout }
})
