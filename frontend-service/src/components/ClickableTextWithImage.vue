<script setup lang="ts">
defineProps<{
    title: string
    url: string
    alt: string
}>()
</script>

<template>
    <div class="flex flex-row justify-center items-center gap-4">
        <img
            :src="url"
            :alt="alt"
            class="w-2 h-2 lg:w-4 lg:h-4 cursor-pointer"
        />
        <p class="text-white text-base lg:text-xl">
            {{ title }}
        </p>
    </div>
</template>
