<script setup lang="ts">
defineProps<{
    url: string
    imagePath: string
    alt: string
}>()

const openLink = (url: string) => window.open(url, '_blank')
</script>

<template>
  <img
    :src="imagePath"
    class="w-6 h-6 cursor-pointer lg:w-10 lg:h-10"
    :alt="alt"
    @click="openLink(url)"
  >
</template>

<style scoped></style>
