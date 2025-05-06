<script setup lang="ts">
defineProps<{
  title: string,
  isActive: boolean
}>()
</script>

<template>
  <button
    class="w-32 h-12 rounded-lg hover:bg-primary hover:text-white duration-300"
    :class="isActive ? 'bg-primary text-white' : 'bg-secondary text-black'">{{ title }}</button>
</template>

<style scoped>

</style>