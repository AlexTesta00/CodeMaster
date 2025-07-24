<script setup lang="ts">
defineProps<{
    content: string
    author: string
    timestamp: string
}>()
</script>

<template>
    <form
        class="group flex flex-row justify-between items-start p-8 bg-black dark:bg-headline text-white m-4 rounded-xl duration-1000"
        data-aos-duration="600"
        data-aos-delay="200"
    >
        <div>
            <label>{{ author }}</label>
            <p>{{ timestamp }}</p>
        </div>
        <p>{{ content }}</p>
    </form>
</template>
