<script setup lang="ts">
import {computed} from 'vue'
import type { Example, ExecutionResult } from '../utils/interface.ts'

const props = defineProps<{
  result: ExecutionResult,
  examples: Example[],
  executionType: string
}>()

const isSuccess = computed(() => props.result.type === 'accepted')

const showTestResults = computed(() => {
  return ['accepted', 'testsFailed', 'compileFailed', 'runtimeError'].includes(props.result.type)
})

const zippedTests = computed(() => {
  if (props.result.type === 'accepted' || props.result.type === 'testsFailed') {
    if (props.executionType === 'compile') {
      return [{
        input: '',
        expectedOutput: '',
        actualOutput: 'Compile successfull',
        passed: true,
        error: null
      }]
    } else {
      const outputs = props.result.output
      return props.examples.map((ex, idx) => ({
        input: ex.input,
        expectedOutput: ex.output,
        actualOutput: outputs[idx] || '',
        passed: props.result.type === 'accepted' || outputs[idx] === ex.output,
        error: null
      }))
    }
  }

  if (props.result.type === 'compileFailed' || props.result.type === 'runtimeError') {
    return [{
      input: '',
      expectedOutput: '',
      actualOutput: props.executionType === "compile" ? 'Compile failed' : 'Runtime error',
      passed: false,
      error: props.result.error + (props.result.stderr ? `\n${props.result.stderr}` : '')
    }]
  }

  if (props.result.type === 'timeLimitExceeded') {
    return [{
      input: '',
      expectedOutput: '',
      actualOutput: '',
      passed: false,
      error: 'Exceed computation time limit.'
    }]
  }

  return []
})

const message = computed(() => {
  if (props.result.type === 'accepted') return 'Codequest resolved!'
  if ('message' in props.result) return props.result.message
  return 'Error'
})

</script>
<template>
  <div v-if="result" class="p-4 text-white rounded-lg font-mono whitespace-pre-wrap">
    <template v-if="showTestResults">
      <div
          v-for="(test, i) in zippedTests"
          :key="i"
          :class="test.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'"
          class="mb-3 p-2 rounded border"
      >
        <template v-if="test.error">
          <div><strong>Errore:</strong></div>
          <pre>{{ test.error }}</pre>
        </template>
        <template v-else>
          <div v-if="executionType === 'run'"><strong>Input:</strong> {{ test.input }}</div>
          <div v-if="executionType === 'run'"><strong>Output atteso:</strong> {{ test.expectedOutput }}</div>
          <div><strong v-if="executionType === 'run'">Output ottenuto:</strong> {{ test.actualOutput }}</div>
        </template>
      </div>
    </template>
    <template v-if="executionType === 'run' && isSuccess">
      <div :class="isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
        {{ message }}
      </div>
    </template>
  </div>
</template>

