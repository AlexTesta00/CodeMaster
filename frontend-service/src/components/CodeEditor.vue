<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { ref, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

monaco.languages.register({ id: 'kotlin' })
monaco.languages.setMonarchTokensProvider('kotlin', {
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, 'identifier'],
      [/[{}()\[\]]/, '@brackets'],
      [/[0-9]+/, 'number'],
      [/"[^"]*"/, 'string'],
      [/[;,.]/, 'delimiter'],
    ],
  },
})
monaco.languages.register({ id: 'scala' })
monaco.languages.setMonarchTokensProvider('scala', {
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, 'identifier'],
      [/[{}()\[\]]/, '@brackets'],
      [/[0-9]+/, 'number'],
      [/"[^"]*"/, 'string'],
      [/[;,.]/, 'delimiter'],
    ],
  },
})

const props = defineProps<{
  modelValue: string
  language: string
}>()

const fontSize = ref(16)

const options = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  theme: 'vs-dark',
  fontSize: fontSize.value,
  minimap: {
    enabled: false,
  },
}

const emit = defineEmits<{
  (e: 'update:modelValue', newCode: string): void
}>()

const code = ref(props.modelValue)

watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== code.value) {
        code.value = newVal
      }
    }
)
</script>

<template>
  <vue-monaco-editor
      v-model:value="code"
      :language="language.toLowerCase()"
      :options="options"
      class="border border-black rounded-md h-96 w-full"
      @update:model-value="emit('update:modelValue', $event)"
  />
</template>
