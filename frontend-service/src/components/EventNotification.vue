<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
    title: string
    message: string
    type: 'success' | 'error' | 'info'
}>()

const visible = ref(true)

const bgColor = {
    success: 'bg-success',
    error: 'bg-error',
    info: 'bg-info',
}

const iconPath = {
    success: '/icons/success.svg',
    error: '/icons/error.svg',
    info: '/icons/info.svg',
}

const textColor = {
    success: 'text-white',
    error: 'text-black',
    info: 'text-black',
}

onMounted(() => {
    setTimeout(() => {
        visible.value = false
    }, 3000)
})
</script>

<template>
  <Transition
    name="fade-slide"
    appear
  >
    <div
      v-if="visible"
      class="fixed bottom-2 flex flex-row justify-start items-center w-4/5 lg:w-2/5 h-14 mb-4 rounded-full"
      :class="bgColor[type]"
    >
      <img
        :src="iconPath[type]"
        class="w-6 h-6 ml-8",
        :alt="type + ' Notification Icon'"
      >
      <div>
        <h1
          class="ml-6 text-sm"
          :class="textColor[type]"
        >
          {{ title }}
        </h1>
        <p
          class="ml-6 text-xs"
          :class="textColor[type]"
        >
          {{ message }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.5s ease;
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}
.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
}
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
