<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import type {CodeQuest, Example} from "../utils/interface.ts";
import {useAuthStore} from "../utils/store.ts";

const user = useAuthStore().nickname

const props = defineProps<{
    codequest: CodeQuest
}>()

const md = new MarkdownIt({
    html: false,
})

const getExamples = (examples: Example[]): string => {
  return examples
      .map((example, index) => {
        const explanation = example.explanation
            ? `Explanation: ${example.explanation}`
            : ''

        return `### ${index + 1}.
**Input**:
\`${example.input}\`

**Output**:
\`${example.output}\`

${explanation}`
      })
      .join('\n\n')
}

const getConstraints = (constraints: string[]): string => {
  return constraints.map(c => `- ${c}`).join('\n')
}

const buildMarkDown = (): string => {
  return `
# ${props.codequest.title}
## Problem
${props.codequest.problem.description}
## Examples
${getExamples(props.codequest.problem.examples)}
## Constraints
${getConstraints(props.codequest.problem.constraints)}
## Difficulty
${props.codequest.difficulty.name}
## Author
${user}

`
}

const renderedContent = computed(() => md.render(buildMarkDown()))
</script>

<template>
  <div
    class="prose dark:prose-invert max-w-none max-h-full"
    v-html="renderedContent"
  />
</template>
