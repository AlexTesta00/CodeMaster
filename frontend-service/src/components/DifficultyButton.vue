<script setup lang="ts">
defineProps<{
    difficulty: string
}>()

const colors: { [key: string]: string } = {
    easy: 'border-success text-success',
    medium: 'border-warning text-warning',
    hard: 'border-error text-error',
}
</script>

<template>
    <p
        class="border-2 w-20 text-center"
        :class="colors[difficulty.toLowerCase()]"
    >
        {{ difficulty }}
    </p>
</template>
