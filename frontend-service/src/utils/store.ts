import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const nickname = ref<string | null>(null)
    const userRole = ref<'admin' | 'user'>('user')

    const setNickname = (newNickname: string) => {
        nickname.value = newNickname
        sessionStorage.setItem('nickname', newNickname)
    }

    const setRole = (role: 'admin' | 'user') => {
        userRole.value = role
        sessionStorage.setItem('userRole', role)
    }

    const loadNickname = () => {
        const storedNickname = sessionStorage.getItem('nickname')
        if (storedNickname) {
            nickname.value = storedNickname
        }
    }

    const loadRole = () => {
        const storedRole = sessionStorage.getItem('userRole')
        if (storedRole) {
            userRole.value = storedRole as 'admin' | 'user'
        }
    }

    const getUserRole = () => userRole.value

    const clearNickname = () => {
        nickname.value = null
        sessionStorage.removeItem('nickname')
    }

    const isLoggedIn = () => !!nickname.value

    return {
        nickname,
        userRole,
        setRole,
        getUserRole,
        loadRole,
        setNickname,
        loadNickname,
        clearNickname,
        isLoggedIn,
    }
})
