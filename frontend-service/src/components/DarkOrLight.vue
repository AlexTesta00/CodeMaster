<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { onMounted, ref, watch } from 'vue'

const isEnabled = ref(false)

watch(isEnabled, (val) => {
    const html = document.documentElement
    if (val) {
        html.classList.add('dark')
    } else {
        html.classList.remove('dark')
    }
})

onMounted(() => {
    isEnabled.value = localStorage.getItem('darkmode') === 'true'
})

watch(isEnabled, (val) => {
    localStorage.setItem('darkmode', String(val))
})
</script>

<template>
  <Switch
    v-model="isEnabled"
    :class="isEnabled ? 'bg-primary' : 'bg-gray-200'"
    class="relative inline-flex items-center h-6 rounded-full w-11"
  >
    <span class="sr-only">Enable darkmode</span>
    <span
      :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
      class="inline-block h-4 w-4 transform rounded-full bg-white transition"
    />
  </Switch>
</template>
