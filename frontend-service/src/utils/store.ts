import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const nickname = ref<string | null>(null)

  const setNickname = (newNickname: string) => {
    nickname.value = newNickname
    sessionStorage.setItem('nickname', newNickname)
  }

  const loadNickname = () => {
    const storedNickname = sessionStorage.getItem('nickname')
    if (storedNickname) {
      nickname.value = storedNickname
    }
  }

  const clearNickname = () => {
    nickname.value = null
    sessionStorage.removeItem('nickname')
  }

  return {
    nickname,
    setNickname,
    loadNickname,
    clearNickname
  }
})