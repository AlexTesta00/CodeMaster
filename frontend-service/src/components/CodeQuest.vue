<script setup lang="ts">
defineProps<{
  index: number,
  title: string,
  difficulty: string,
  isSolved: boolean
}>()

const colors: { [key: string]: string} = {
  'easy': 'success',
  'medium': 'warning',
  'hard': 'error'
}
</script>

<template>
  <div class="flex flex-row justify-between items-start p-8 bg-white m-4 rounded-xl"
       data-aos="zoom-in"
       data-aos-duration="600">
    <p>{{index}}.{{title}}</p>
    <div class="flex flex-row gap-6">
      <img src="/icons/checked.svg" alt="CodeQuest Solved Mark" class="w-6 h-6 lg:w-8 lg:h-8" v-if="isSolved">
      <p
        class="border-2 w-20 text-center"
        :class="'border-' + colors[difficulty.toLowerCase()] + ' text-' + colors[difficulty.toLowerCase()]">{{ difficulty }}</p>
    </div>

  </div>
</template>

<style scoped>

</style>