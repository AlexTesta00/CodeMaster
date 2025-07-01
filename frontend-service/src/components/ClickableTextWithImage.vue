<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()

defineProps<{
  title: string
  url: string
  alt: string
}>()
</script>

<template>
  <div
      class="flex flex-row justify-center items-center gap-4 cursor-pointer"
      @click="emit('click')"
  >
    <img
        :src="url"
        :alt="alt"
        class="w-2 h-2 lg:w-4 lg:h-4"
    >
    <p class="text-white text-base lg:text-xl">
      {{ title }}
    </p>
  </div>
</template>
