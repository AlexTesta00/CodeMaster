<script setup lang="ts">
import { ref } from 'vue'
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/vue'
import YesOrNoDialog from './YesOrNoDialog.vue'

const allowedLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'c',
    'c++',
    'c#',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'dart',
]

const selectedLanguage = ref<string>('')
const isOpenDialog = ref(false)

const emit = defineEmits<{
    (e: 'languageSelected', language: string): void
}>()

const handleLanguageChange = (lang: string) => {
    selectedLanguage.value = lang
    isOpenDialog.value = true
}

const confirmDialog = () => {
    emit('languageSelected', selectedLanguage.value)
    closeDialog()
}

const closeDialog = () => {
    isOpenDialog.value = false
}
</script>

<template>
    <div class="w-full max-w-sm mx-auto z-10">
        <Listbox
            v-model="selectedLanguage"
            @update:model-value="handleLanguageChange"
        >
            <div class="relative">
                <ListboxButton
                    class="w-full border rounded px-4 py-2 text-left bg-white"
                >
                    {{ selectedLanguage || 'Select your starred language...' }}
                </ListboxButton>
                <ListboxOptions
                    class="absolute mt-1 w-full border bg-white rounded shadow z-30"
                >
                    <ListboxOption
                        v-for="lang in allowedLanguages"
                        :key="lang"
                        :value="lang"
                        class="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    >
                        {{ lang }}
                    </ListboxOption>
                </ListboxOptions>
            </div>
        </Listbox>

        <!-- Dialog -->
        <yes-or-no-dialog
            title="Are you sure"
            :message="
                'Do you want to add ' +
                selectedLanguage +
                ' to yours starred languages?'
            "
            :is-open-dialog="isOpenDialog"
            @confirm="confirmDialog"
            @close="isOpenDialog = false"
        />
    </div>
</template>
