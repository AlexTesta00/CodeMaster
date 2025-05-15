<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { ref } from 'vue'

const code = ref(
    '"abcd" --> "dcba" \n12345 --> 54321\n["a", "b"] --> ["b", "a"]',
)
const fontSize = ref(16)

const options = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
    defaultLanguage: 'python',
    theme: 'vs-dark',
    width: '80%',
    height: '80%',
    fontSize: fontSize.value,
    minimap: {
        enabled: false,
    },
}
</script>

<template>
    <vue-monaco-editor
        v-model:value="code"
        language="python"
        theme="vs-dark"
        :options="options"
        class="border rounded-full"
    />
</template>
