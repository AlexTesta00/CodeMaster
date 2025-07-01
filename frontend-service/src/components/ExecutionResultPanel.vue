<script setup lang="ts">
import { computed } from 'vue'
import type { Example, ExecutionResult } from '../utils/interface.ts'

const props = defineProps<{
  result: ExecutionResult,
  examples: Example[]
}>()

const isSuccess = computed(() => props.result.type === 'Accepted')

const showTestResults = computed(() => {
  return props.result.type === 'Accepted' || props.result.type === 'TestsFailed'
})

const zippedTests = computed(() => {
  if (!showTestResults.value) return []

  if (props.result.type === 'Accepted' || props.result.type === 'TestsFailed') {
    const outputs = props.result.output
    return props.examples.map((ex, idx) => ({
      input: ex.input,
      expectedOutput: ex.output,
      actualOutput: outputs[idx] || '',
      passed: props.result.type === 'Accepted' || (props.result.type === 'TestsFailed' && outputs[idx] === ex.output)
    }))
  }

  return []
})

const message = computed(() => {
  if (props.result.type === 'Accepted') return 'Tutti i test superati.'
  if ('message' in props.result) return props.result.message
  return 'Errore'
})
</script>

<template>
  <div v-if="result" class="p-4 rounded font-mono whitespace-pre-wrap">
    <template v-if="showTestResults">
      <div
          v-for="(test, i) in zippedTests"
          :key="i"
          :class="test.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'"
          class="mb-3 p-2 rounded border"
      >
        <div><strong>Input:</strong> {{ test.input }}</div>
        <div><strong>Output atteso:</strong> {{ test.expectedOutput }}</div>
        <div><strong>Output ottenuto:</strong> {{ test.actualOutput }}</div>
      </div>
    </template>
    <template v-else>
      <div :class="isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
        {{ message }}
      </div>
    </template>
  </div>
</template>
