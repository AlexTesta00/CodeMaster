<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { onMounted, ref, watch } from 'vue'
import type {CodeQuest, Language} from "../utils/interface.ts";
import {addNewSolution} from "../utils/api.ts";

const props = defineProps<{
    currentLanguage: Language,
    codequest: CodeQuest,
    oldCode: string,
    user: string
}>()

const codeTemplates = ref<Record<string, string> | null>(null)
const testTemplates = ref<Record<string, string> | null>(null)
const code = ref('')
const testCode = ref('')
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
        if (codeTemplates.value) {
            code.value = codeTemplates.value[lang.name] || '// No code template available'
        }
        if (testTemplates.value) {
            testCode.value = testTemplates.value[lang.name] || '// No test template available'
        }
    },
)

onMounted(async () => {
    try {
        const resTest = await fetch('/data/testTemplates.json')
        if (!resTest.ok) {
          testCode.value = 'No test template available'
        }
        testTemplates.value = await resTest.json()
        testCode.value =
            testTemplates.value?.[props.currentLanguage.name] ||
            '// No code template available'

        if(props.oldCode) {
          code.value = props.oldCode
        } else {
          const resCode = await fetch('/data/languageTemplates.json')
          if (!resCode.ok) {
            code.value = 'No test template available'
          }
          codeTemplates.value = await resCode.json()
          code.value =
              codeTemplates.value?.[props.currentLanguage.name] ||
              '// No code template available'
          await addNewSolution(
              props.user,
              props.codequest.id,
              {
                name: props.currentLanguage.name,
                version: props.currentLanguage.version,
                fileExtension: props.currentLanguage.fileExtension
              },
              props.codequest.difficulty,
              false,
              code.value,
              testCode.value //ADD TEST GENERATOR?
          )
        }
    } catch (error) {
        void error
        code.value = 'No template available'
    }
})
</script>

<template>
  <vue-monaco-editor
    v-model:value="code"
    :language="props.currentLanguage.name"
    theme="vs-dark"
    :options="options"
    class="border rounded-full"
  />
</template>
