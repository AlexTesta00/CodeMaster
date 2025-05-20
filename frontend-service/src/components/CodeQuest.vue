<script setup lang="ts">
import DifficultyButton from './DifficultyButton.vue'

defineProps<{
    index: number
    title: string
    difficulty: string
    isSolved: boolean
}>()
</script>

<template>
  <div
    class="flex flex-row justify-between items-start p-8 bg-white m-4 rounded-xl hover:bg-primary hover:text-white duration-1000"
    data-aos="zoom-in"
    data-aos-duration="600"
    data-aos-anchor="#questcontainer"
    data-aos-delay="200"
  >
    <p>{{ index }}.{{ title }}</p>
    <div class="flex flex-row gap-6">
      <img
        v-if="isSolved"
        src="/icons/checked.svg"
        alt="CodeQuest Solved Mark"
        class="w-6 h-6 lg:w-8 lg:h-8"
      >
      <difficulty-button :difficulty="difficulty.toLowerCase()" />
    </div>
  </div>
</template>
