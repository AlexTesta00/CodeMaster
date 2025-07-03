<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { ref } from 'vue'
import { isDarkModeEnabled, toggleDarkMode } from '../utils/dark-mode.ts'

const isEnabled = ref(isDarkModeEnabled())
</script>

<template>
  <Switch
    v-model="isEnabled"
    :class="isEnabled ? 'bg-primary' : 'bg-gray-200'"
    class="relative inline-flex items-center h-6 rounded-full w-11"
    @click="toggleDarkMode()"
  >
    <span class="sr-only">Enable darkmode</span>
    <span
      :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
      class="inline-block h-4 w-4 transform rounded-full bg-white transition"
    />
  </Switch>
</template>
