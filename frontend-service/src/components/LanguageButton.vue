<script setup lang="ts">
defineProps<{
    names: string[]
    isEditable: boolean
}>()

const emit = defineEmits<{
    (e: 'removeLanguage', language: string): void
}>()
</script>

<template>
  <div
    v-for="name in names"
    :key="name"
    class="bg-black rounded-lg p-4 flex flex-row"
    :class="isEditable ? 'animate-shake' : ''"
  >
    <p class="text-white">
      <span
        v-if="isEditable"
        class="cursor-pointer border border-white px-2 py-0.5 rounded hover:bg-white hover:text-black transition"
        title="Remove"
        @click="emit('removeLanguage', name)"
      >X</span>
      {{ name }}
    </p>
  </div>
</template>

<style scoped></style>
