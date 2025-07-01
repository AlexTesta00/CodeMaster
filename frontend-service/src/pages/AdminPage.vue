<script setup lang="ts">
import LoadingPage from './LoadingPage.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../utils/store.ts'
import UserCard from '../components/UserCard.vue'
import type {CodeQuest, UserManager} from '../utils/interface.ts'
import {banUser, deleteCodequestById, getAllCodequests, getAllUsers, logoutUser, unbanUser} from '../utils/api.ts'
import { isSome } from 'fp-ts/Option'
import { errorToast, successToast } from '../utils/notify.ts'
import router from '../router'
import CodeQuestComp from "../components/CodeQuestComp.vue";
import YesOrNoDialog from "../components/YesOrNoDialog.vue";

const isLoading = ref(false)
const auth = useAuthStore()

const users = ref<UserManager[]>([])
const codequests = ref<CodeQuest[]>([])
const codequestToDelete = ref('')

const isQuestDeleteOpen = ref(false)

const handleClose = () => {
  isQuestDeleteOpen.value = false
  codequestToDelete.value = ''
}

const handleConfirm = async () => {
  isQuestDeleteOpen.value = false
  if(codequestToDelete) {
    await deleteCodequestById(codequestToDelete.value)
    codequests.value = codequests.value.filter(q => q.id !== codequestToDelete.value)
  }
}

const openDeleteDialog = (questId: string) => {
  isQuestDeleteOpen.value = true
  codequestToDelete.value = questId
}

const handleBan = async (name: string) => {
  if(auth.nickname){
    try {
      isLoading.value = true
      const response = await banUser(auth.nickname, name)
      if (response.success) {
        await successToast(`${name} banned successfully`)
      } else {
        await errorToast(`Failed to ban ${name}`)
      }
    }catch (error) {
      await errorToast('Failed to ban user, error on API call')
    }finally {
      isLoading.value = false
    }
  }else{
    await errorToast('You are not logged in')
  }
}

const handleUnban = async (name: string) => {
  if(auth.nickname){
    try {
      isLoading.value = true
      const response = await unbanUser(auth.nickname, name)
      if (response.success) {
        await successToast(`${name} unbanned successfully`)
      } else {
        await errorToast(`Failed to unban ${name}`)
      }
    }catch (error) {
      await errorToast('Failed to unban user, error on API call')
    }finally {
      isLoading.value = false
    }
  }else{
    await errorToast('You are not logged in')
  }
}

const logout = async () => {
  if (!auth.nickname) return
  try {
    isLoading.value = true
    await logoutUser(auth.nickname)
    auth.clearNickname()
    await successToast('User logged out successfully')
    await router.push('/')
  } catch {
    await errorToast('User not logged out')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  auth.loadNickname()
  if(auth.nickname){
    try {
      isLoading.value = true
      const response = await getAllUsers()
      if (response.success) {
        users.value = response.user.filter((user) => user.userInfo.nickname.value !== auth.nickname)
        await successToast('All users retrieved successfully')
      } else {
        await errorToast('Failed to retrieve users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      await errorToast('Failed to retrieve users')
    }finally {
      isLoading.value = false
    }
  }else{
    await errorToast('You are not logged in')
  }
  try{
    const questRes = await getAllCodequests()
    if(questRes.success) {
      codequests.value = questRes.codequests
    }
  } catch (error) {
    console.error('Error fetching codequests:', error)
    await errorToast('Failed to retrieve all codequests')
  }finally {
    isLoading.value = false
  }
})


</script>

<template>
  <section
    class="lg:ml-16 min-h-screen bg-background dark:bg-bgdark animate-fade-in overflow-y-hidden"
    v-if="isLoading === false"
  >
    <yes-or-no-dialog
        title="Are you sure?"
        message="This Codequest will be deleted permanently"
        :is-open-dialog="isQuestDeleteOpen"
        @confirm="handleConfirm"
        @close="handleClose"
    />
    <!-- Title welcome back -->
    <header>
      <h1
        class="text-black text-center lg:text-left text-3xl lg:text-5xl mt-6 dark:text-white lg:ml-4 animate-fade-in"
      >
        Welcome Back 👋🏻,<br>{{ auth.nickname }}
      </h1>
    </header>

    <!-- Main Content -->
    <div
      class="flex flex-col items-center gap-10 lg:gap-20 py-8 px-4"
      data-aos="zoom-in"
      data-aos-duration="1400"
    >
      <!-- Users Section -->
      <h1
        class="text-black text-center text-3xl lg:text-4xl mt-8 dark:text-white w-full"
        data-aos="zoom-in"
        data-aos-duration="1400"
      >
        Users
      </h1>

      <div class="overflow-x-auto w-full py-8">
        <div class="flex flex-nowrap gap-4 px-2" v-if="users.length > 0">
          <user-card
            v-for="user in users"
            :key="user.userInfo.nickname.value"
            :image="isSome(user.profilePicture) ? user.profilePicture.value.url : '/images/barney.png'"
            alt="Decorative Image"
            :name="user.userInfo.nickname.value"
            @ban="handleBan"
            @unban="handleUnban"
          />
        </div>
        <p v-else class="text-center to-error dark:text-gray-400 text-lg italic">
          No Users Found
        </p>
      </div>

      <!-- CodeQuest Section -->
      <h1
        class="text-black text-center text-3xl lg:text-4xl mt-16 dark:text-white w-full"
        data-aos="zoom-in"
        data-aos-duration="1400"
      >
        CodeQuest
      </h1>
      <div class="bg-gray-400 w-4/5 rounded-3xl p-6 mb-8 min-h-[200px]">
        <code-quest-comp
            v-for="(codequest, index) in codequests"
            :quest-id="codequest.id"
            :key="codequest.id || index"
            :index="index + 1"
            :title="codequest.title"
            :difficulty="codequest.difficulty.name"
            :is-solved="true"
            :deletable="true"
            @deletd="openDeleteDialog(codequest.id)"
        />
      </div>
    </div>

    <!-- Fixed Logout Button -->
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        @click="logout"
        class="bg-error text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
      >
        Logout
      </button>
    </div>
  </section>

  <loading-page v-if="isLoading" />
</template>
