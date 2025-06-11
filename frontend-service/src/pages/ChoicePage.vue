<script setup>
import { ref, onMounted } from 'vue'
import CardChoicheable from '../components/CardChoicheable.vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'
import router from '../router/index.js'
import LoadingPage from './LoadingPage.vue'
import { useAuthStore } from '../utils/store.js'
import { updateProfilePicture } from '../utils/api.js'
import { successToast } from '../utils/notify.js'

const characters = ref([])
const hoverText = ref('')
const errorMessage = ref('')
const currentFigure = ref('')
const isLoading = ref(false)
const auth = useAuthStore()

const goToProfilePage = () => {
    router.push('/profile')
}

const updateUserProfilePicture = async ({ imageUrl, alt }) => {
    if (!auth.nickname) return
    try {
        isLoading.value = true
        await updateProfilePicture(auth.nickname, {
            url: imageUrl,
            alt: alt,
        })
        await successToast('User profile picture updated successfully')
        goToProfilePage()
    } catch {
        await successToast('User profile picture not updated')
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    try {
        isLoading.value = true
        const response = await fetch('/data/characters.json')
        if (!response.ok) {
            errorMessage.value = 'Failed to fetch characters'
        }
        characters.value = await response.json()
    } catch (error) {
        errorMessage.value = "Can't load characters"
        console.error('Errore durante il fetch dei characters:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
  <section
    v-if="isLoading === false"
    class="ml-4 mr-4 min-h-screen overflow-y-hidden animate-fade-in bg-white dark:bg-bgdark"
  >
    <header>
      <h1
        class="text-3xl md:text-5xl font-bold text-center mt-8 md:mt-24 dark:text-background"
      >
        Choose your character
      </h1>
    </header>
    <div
      class="flex flex-col md:flex-row justify-center items-center mb-12 md:mt-24 md:gap-x-16"
    >
      <card-choicheable
        v-for="(character, index) in characters"
        :key="index"
        v-model="currentFigure"
        :title="character.name"
        :image-url="character.imageUrl"
        :alt="character.alt"
        :description="character.description"
        @hover-in="hoverText = $event"
        @hover-out="hoverText = ''"
        @selected="updateUserProfilePicture"
      />
    </div>
    <p class="text-center hidden md:block dark:text-background">
      {{ hoverText }}
    </p>

    <div class="flex flex-row justify-center items-center w-full mb-8">
      <button-with-image
        class="w-full md:w-64 lg:mt-6"
        image-url="/icons/back.svg"
        alt-text="Return to profile page"
        title="Return Back"
        @click="router.back()"
      />
    </div>
  </section>
  <footer
    class="flex flex-row justify-center items-center animate-fade-in bg-primary w-full md:bg-background md:dark:bg-bgdark md:fixed"
  />
  <loading-page v-if="isLoading" />
</template>
