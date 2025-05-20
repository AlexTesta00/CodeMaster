<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{
    content: string
}>()

const md = new MarkdownIt({
    html: false,
})

const renderedContent = computed(() => md.render(props.content))
</script>

<template>
  <div
    class="prose dark:prose-invert max-w-none max-h-full"
    v-html="renderedContent"
  />
</template>
