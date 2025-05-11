<script setup lang="ts">
defineProps<{
    title: string
    imageUrl: string
    alt?: string
    description: string
}>()

const emit = defineEmits<{
    (e: 'hover-in', text: string): void
    (e: 'hover-out', text: string): void
}>()
</script>

<template>
    <div
        class="flex flex-col items-center justify-center mt-12 md:hover:animate-bounce transition-all"
        @mouseover="emit('hover-in', description)"
        @mouseleave="emit('hover-out', description)"
    >
        <img :src="imageUrl" class="w-32 h-32 rounded-xl" :alt="alt" />
        <h2
            class="text-lg md:text-2xl mt-2 md:mt-4 cursor-default select-none font-normal dark:text-background"
        >
            {{ title }}
        </h2>
    </div>
</template>

<style scoped></style>
