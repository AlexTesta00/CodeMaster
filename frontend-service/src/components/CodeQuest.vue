<script setup lang="ts">
defineProps<{
  index: number,
  title: string,
  difficulty: string,
  isSolved: boolean
}>()

const colors: { [key: string]: string} = {
  'easy': 'border-success text-success',
  'medium': 'border-warning text-warning',
  'hard': 'border-error text-error'
}

</script>

<template>
  <div class="flex flex-row justify-between items-start p-8 bg-white m-4 rounded-xl hover:bg-primary hover:text-white duration-1000"
       data-aos="zoom-in"
       data-aos-duration="600"
       data-aos-anchor="#questcontainer"
       data-aos-delay="200">
    <p>{{index}}.{{title}}</p>
    <div class="flex flex-row gap-6">
      <img src="/icons/checked.svg" alt="CodeQuest Solved Mark" class="w-6 h-6 lg:w-8 lg:h-8" v-if="isSolved">
      <p
        class="border-2 w-20 text-center"
        :class="colors[difficulty.toLowerCase()]">{{ difficulty }}</p>
    </div>

  </div>
</template>