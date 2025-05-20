<script setup lang="ts">
import DashboardCard from './DashboardCard.vue'
import ImageLink from './ImageLink.vue'

export type Link = {
    url: string
    image: string
    alt: string
}

defineProps<{
    links: [Link]
    imageUrl: string
    name: string
    role: string
    alt: string
}>()
</script>

<template>
  <dashboard-card class="gap-4">
    <img
      :src="imageUrl"
      class="w-32 h-32 rounded-full object-cover"
      :alt="alt"
    >
    <h1 class="text-white text-base text-center lg:text-3xl">
      {{ name }}
    </h1>
    <h2 class="text-center text-xs text-gray-500 lg:text-xl">
      {{ role }}
    </h2>
    <div class="flex flex-row justify-center items-center gap-6">
      <ImageLink
        v-for="link in links"
        :key="link"
        :url="link.url"
        :image-path="link.image"
        :alt="link.alt"
      />
    </div>
  </dashboard-card>
</template>

<style scoped></style>
