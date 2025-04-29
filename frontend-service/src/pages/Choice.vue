<script setup>
import { ref, onMounted } from 'vue'
import CardChoicheable from '../components/CardChoicheable.vue'
import FlatBackButton from '../components/FlatBackButton.vue'

const characters = ref([])
const hoverText = ref('')

onMounted(async () => {
  try {
    const response = await fetch('/data/characters.json')
    if (!response.ok) {
      throw new Error('Failed to fetch characters') //TODO: Tech debit -> error page
    }
    characters.value = await response.json()
  } catch (error) {
    console.error('Errore durante il fetch dei characters:', error) //TODO: Tech debit -> error page
  }
})
</script>

<template>
  <section class="ml-4 mr-4 md:overflow-y-hidden animate-fade-in dark:bg-bgdark">
    <header>
      <h1 class="text-3xl md:text-5xl font-bold text-center mt-8 md:mt-24 dark:text-background">Choose your character</h1>
    </header>
    <div class="flex flex-col md:flex-row justify-center items-center mb-12 md:mt-24 md:gap-x-16">
      <card-choicheable
        v-for="(character, index) in characters"
        :key="index"
        :title="character.name"
        :imageUrl="character.imageUrl"
        :alt="character.alt"
        :description="character.description"
        @hover-in="hoverText = $event"
        @hover-out="hoverText = ''"
      />
    </div>
    <p class="text-center hidden md:block dark:text-background">{{ hoverText }}</p>
  </section>
  <footer class="flex flex-row justify-center items-center animate-fade-in bg-primary w-full md:bg-background md:dark:bg-bgdark md:fixed">
    <flat-back-button></flat-back-button>
  </footer>
</template>

<style scoped>

</style>