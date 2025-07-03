<script setup lang="ts">
const props = defineProps<{
  image: string,
  alt: string,
  name: string,
}>()

const emit = defineEmits(['ban', 'unban'])

function emitBan() {
  emit('ban', props.name)
}

function emitUnban() {
  emit('unban', props.name)
}
</script>

<template>
  <div class="w-64 flex-shrink-0 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
    <img class="object-cover w-full h-56" :src="image" :alt="alt">

    <div class="py-5 text-center">
      <p class="block text-xl font-bold text-gray-800 dark:text-white">{{ name }}</p>
      <a class="block text-sm text-gray-700 dark:text-gray-200 underline cursor-pointer" @click="emitBan">Ban</a>
      <a class="block text-sm text-gray-700 dark:text-gray-200 underline cursor-pointer" @click="emitUnban">Unban</a>
    </div>
  </div>
</template>