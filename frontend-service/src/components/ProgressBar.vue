<script setup lang="ts">
defineProps<{
  difficulty: string,
  currentValue: number,
  maxValue: number
}>()

const colors: { [key: string]: string} = {
  'easy': 'success',
  'medium': 'warning',
  'hard': 'error'
}
</script>

<template>
<div class="flex flex-col justify-center items-start w-full h-1/5 lg:h-full rounded-xl"
     :key="difficulty">
  <h2 class="text-white ml-2 font-bold">{{ difficulty }} {{ currentValue }}/{{ maxValue }} <span class="text-xs text-gray-500">CodeQuest</span></h2>
  <progress
    class="w-11/12 h-2 rounded-lg mt-2 ml-2"
    :value="currentValue"
    :max="maxValue"
    :class="'[&::-webkit-progress-value]:bg-' + colors[difficulty.toLowerCase()] + ' [&::-moz-progress-value]:bg-' + colors[difficulty.toLowerCase()]"
    />
</div>
</template>

<style scoped>

</style>

:class="'bg-' + colors[difficulty.toLowerCase()]"