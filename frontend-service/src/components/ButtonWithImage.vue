<script setup lang="ts">
defineProps<{
    title: string
    imageUrl: string
    altText: string
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()

const handleClick = () => {
    emit('click')
}
</script>

<template>
  <button
    class="flex items-center px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-primary rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
    @click="handleClick"
  >
    <img
      :src="imageUrl"
      :alt="altText"
      class="w-5 h-5"
    >
    <span class="mx-1 lg:text-xl">{{ title }}</span>
  </button>
</template>
