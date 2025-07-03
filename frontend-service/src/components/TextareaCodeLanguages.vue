<script setup lang="ts">
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/vue'
import {ref, watch} from 'vue'
import type {Codes} from "../utils/interface.ts";

const props = defineProps<{
    availableLanguages: Codes[],
    currentLanguage: Codes
}>()

const selectedLanguage = ref<Codes>(
    props.currentLanguage ?? props.availableLanguages[0]
)

const emit = defineEmits<{
  (e: 'language-selected', language: Codes): void
}>()

const confirmSelection = () => {
    emit('language-selected', selectedLanguage.value)
}

watch(
    () => props.currentLanguage,
    (newLang) => {
      if (newLang) selectedLanguage.value = newLang
    }
)
</script>

<template>
  <div class="min-w-[8rem] z-10 bg-primary rounded-lg">
    <Listbox
      v-model="selectedLanguage"
      @update:model-value="confirmSelection"
    >
      <div class="relative">
        <ListboxButton class="w-full px-4 py-2 text-left text-white">
          {{ selectedLanguage.language }}
        </ListboxButton>
        <ListboxOptions
          class="absolute mt-1 w-full border bg-white rounded shadow z-30"
        >
          <ListboxOption
            v-for="lang in availableLanguages"
            :key="lang.language"
            :value="lang"
            class="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            {{ lang.language }}
          </ListboxOption>
        </ListboxOptions>
      </div>
    </Listbox>
  </div>
</template>
