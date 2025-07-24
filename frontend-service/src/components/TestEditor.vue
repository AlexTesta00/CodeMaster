<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { onMounted, ref, watch } from 'vue'
import type { Language } from '../utils/interface.ts'

const props = defineProps<{
    language: Language
}>()

const testTemplates = ref<Record<string, string> | null>(null)

const code = ref('')
const fontSize = ref(16)

const options = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
    defaultLanguage: 'java',
    theme: 'vs-dark',
    width: '80%',
    height: '80%',
    fontSize: fontSize.value,
    minimap: {
        enabled: false,
    },
}

watch(
    () => props.language,
    (lang) => {
        if (testTemplates.value) {
            code.value =
                testTemplates.value[lang.name] ||
                '// No test template available'
        }
    },
)

onMounted(async () => {
    try {
        const resTest = await fetch('/data/testTemplates.json')
        if (!resTest.ok) {
            code.value = 'No test template available'
        }
        testTemplates.value = await resTest.json()
        code.value =
            testTemplates.value?.[props.language.name] ||
            '// No code template available'
    } catch (error) {
        void error
        code.value = 'No template available'
    }
})
</script>

<template>
    <vue-monaco-editor
        v-model:value="code"
        language="java"
        theme="vs-dark"
        :options="options"
        class="border rounded-full"
    />
</template>
