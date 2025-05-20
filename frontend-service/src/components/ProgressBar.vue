<script setup lang="ts">
defineProps<{
    difficulty: string
    currentValue: number
    maxValue: number
}>()

const colors: { [key: string]: string } = {
    easy: '[&::-webkit-progress-value]:bg-success [&::-moz-progress-value]:bg-success',
    medium: '[&::-webkit-progress-value]:bg-warning [&::-moz-progress-value]:bg-warning',
    hard: '[&::-webkit-progress-value]:bg-error [&::-moz-progress-value]:bg-error',
}
</script>

<template>
  <div
    :key="difficulty"
    class="flex flex-col justify-center items-start w-full h-1/5 lg:h-full rounded-xl"
  >
    <h2 class="text-white ml-2 font-bold">
      {{ difficulty }} {{ currentValue }}/{{ maxValue }}
      <span class="text-xs text-gray-500">CodeQuest</span>
    </h2>
    <progress
      class="w-11/12 h-2 rounded-lg mt-2 ml-2"
      :value="currentValue"
      :max="maxValue"
      :class="colors[difficulty.toLowerCase()]"
    />
  </div>
</template>
