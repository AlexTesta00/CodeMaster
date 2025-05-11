<script setup lang="ts">
import { ref } from 'vue'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'

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
    <TransitionRoot
      appear
      :show="isOpenDialog"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeDialog"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-headline p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-white"
                >
                  Are you sure?
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Do you want to select
                    <strong>{{ selectedLanguage }}</strong>
                    as your favorite language?
                  </p>
                </div>

                <div class="mt-4 flex flex-row gap-4">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="confirmDialog"
                  >
                    Yes, I'm sure
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border text-white border-error hover:bg-error hover:text-black duration-200 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="closeDialog"
                  >
                    No, cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
