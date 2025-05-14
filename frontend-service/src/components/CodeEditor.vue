<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    currentLanguage: string
}>()

const templates = ref<Record<string, string> | null>(null)
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
    () => props.currentLanguage,
    (lang) => {
        if (templates.value) {
            code.value = templates.value[lang] || '// No template available'
        }
    },
)

onMounted(async () => {
    try {
        const response = await fetch('/data/languageTemplates.json')
        if (!response.ok) {
            code.value = 'No template available'
        }
        templates.value = await response.json()
        code.value =
            templates.value?.[props.currentLanguage] ||
            '// No template available'
    } catch (error) {
        void error
        code.value = 'No template available'
    }
})
</script>

<template>
    <vue-monaco-editor
        v-model:value="code"
        :language="props.currentLanguage.toLowerCase()"
        theme="vs-dark"
        :options="options"
        class="border rounded-full"
    />
</template>
