<script setup lang="ts">
defineProps({
  name: String,
  status: Boolean,
})
</script>

<template>
  <div class="bg-secondary w-4/5 h-32 lg:w-1/4 lg:h-44 mt-8 rounded-3xl flex flex-col items-start justify-center gap-4 lg:ml-6">
    <h1 class="text-4xl ml-7">{{ name }}</h1>
    <p class="ml-7 "> Status:
      <span v-if="status"> Online
        <span class="animate-pulse">🟢</span>
      </span> <span v-else> Offline
        <span class="animate-pulse">🔴</span>
      </span>
    </p>
  </div>
</template>
