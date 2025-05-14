<script setup lang="ts">
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/vue'
import { ref } from 'vue'

defineProps<{
    allowedLanguage: string[]
}>()

const selectedLanguage = ref('Java')

const emit = defineEmits<{
    (e: 'languageSelected', language: string): void
}>()

const confirmSelection = () => {
    emit('languageSelected', selectedLanguage.value)
}
</script>

<template>
    <div class="min-w-[8rem] z-10 bg-primary rounded-lg">
        <Listbox
            v-model="selectedLanguage"
            @update:model-value="confirmSelection"
        >
            <div class="relative">
                <ListboxButton class="w-full px-4 py-2 text-left text-white">
                    {{ selectedLanguage }}
                </ListboxButton>
                <ListboxOptions
                    class="absolute mt-1 w-full border bg-white rounded shadow z-30"
                >
                    <ListboxOption
                        v-for="lang in allowedLanguage"
                        :key="lang"
                        :value="lang"
                        class="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    >
                        {{ lang }}
                    </ListboxOption>
                </ListboxOptions>
            </div>
        </Listbox>
    </div>
</template>
