<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { ref, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import type {Codes} from '../utils/interface.ts'

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
  currentLanguage: Codes
}>()

const fontSize = ref(16)
const code = ref(props.currentLanguage.templateCode || '')

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
  (e: 'update:code', newCode: string): void
}>()

watch(
    () => props.currentLanguage.templateCode,
    (newCode) => {
      if (newCode !== undefined && newCode !== code.value) {
        code.value = newCode
      }
    },
    { immediate: true }
)

</script>

<template>
  <vue-monaco-editor
      v-model:value="code"
      :language="props.currentLanguage.language.toLowerCase()"
      :options="options"
      class="border rounded-md h-96 w-full"
      @update:model-value="emit('update:code', $event)"
  />
</template>
