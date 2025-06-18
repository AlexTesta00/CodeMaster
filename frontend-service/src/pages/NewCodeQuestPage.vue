<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'
import TestEditor from '../components/TestEditor.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import router from '../router'
import {addNewCodequest} from "../utils/api.ts";
import type { Language } from "../utils/interface.ts";

const title = ref('')
const description = ref('')
const languages = ref<Language[]>([])
const examples = ref([
  { input: '', output: '', explanation: '' }
])
const constraints = ref('')

const isBackDialogOpen = ref(false)
const isQuestDialogOpen = ref(false)

const allowedLanguages = ref([
    {
      name: 'Java',
      version: '17',
      fileExtension: '.java'
    },
    {
      name: 'Scala',
      version: '2.11.10',
      fileExtension: '.scala'
    },
    {
      name: 'Kotlin',
      version: '1.9.22',
      fileExtension: '.kt'
    }
    ])
const difficulties = ref(['EASY', 'MEDIUM', 'HARD'])
const difficulty = ref(difficulties.value[0])
const leftPanelWidth = ref(
    parseInt(localStorage.getItem('leftPanelWidth') || '500'),
)
let isDragging = false

const isLanguageSelected = (lang: Language): boolean => {
  return languages.value.some(l => l.name === lang.name)
}

const addExample = () => {
  examples.value.push({ input: '', output: '', explanation: '' })
}

const removeExample = (index: number) => {
  if (examples.value.length > 1) {
    examples.value.splice(index, 1)
  }
}

const toggleLanguage = (lang: Language) => {
  const exists = isLanguageSelected(lang)
  if (exists) {
    languages.value = languages.value.filter(l => l.name !== lang.name)
  } else {
    languages.value.push(lang)
  }
}

const startDragging = (e: MouseEvent) => {
  e.preventDefault()
  isDragging = true
}

const stopDragging = () => {
  isDragging = false
  localStorage.setItem('leftPanelWidth', leftPanelWidth.value.toString())
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return

  const min = 200
  const max = window.innerWidth - 200
  leftPanelWidth.value = Math.min(Math.max(e.clientX, min), max)
}

const handleConfirm = () => {
  isBackDialogOpen.value = false
  router.push('/profile')
}

const handleClose = () => {
  isBackDialogOpen.value = false
}

const handleQuestConfirm = () => {
  const nickname = sessionStorage.getItem('nickname')

  if (!nickname) {
    console.error('Missing nickname')
    return
  }

  addNewCodequest(
      title.value,
      sessionStorage.getItem('nickname'),
      {
        description: description.value,
        examples: examples.value,
        constraints: [constraints.value]
      },
      languages.value,
      {
        name: difficulty.value
      }
  )

  isQuestDialogOpen.value = false
  router.push('/profile')
}

const handleQuestClose = () => {
  isQuestDialogOpen.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDragging)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopDragging)
})
</script>

<template>
  <section
      class="h-[100vh] flex flex-row bg-background dark:bg-bgdark animate-fade-in overflow-hidden"
  >
    <!-- Dialog for return back -->
    <yes-or-no-dialog
        title="Are you sure?"
        message="Changes will not be saved and the codequest will not be forwarded"
        :is-open-dialog="isBackDialogOpen"
        @confirm="handleConfirm"
        @close="handleClose"
    />

    <!-- Dialog for send codequest -->
    <yes-or-no-dialog
        title="Are you sure?"
        message="The codequest will be forwarded"
        :is-open-dialog="isQuestDialogOpen"
        @confirm="handleQuestConfirm"
        @close="handleQuestClose"
    />

    <!-- Form Section -->
    <form
        :style="{ width: leftPanelWidth + 'px' }"
        class="flex h-full flex-col overflow-auto min-w-[200px] max-w-[calc(100%-200px)] gap-4 pb-16 ml-4"
        data-aos="fade-up"
        data-aos-duration="1600"
    >
      <label
          for="title"
          class="text-black dark:text-white text-2xl"
      >Title*
        <span class="text-base text-gray-500">(Max 50 char)</span></label>
      <input
          id="title"
          type="text"
          name="title"
          v-model="title"
          class="border-2 border-primary w-2/5 rounded-l"
          placeholder="Example: Reverse string"
          required
      >
      <label
          for="description"
          class="text-black dark:text-white text-2xl"
      >Description*</label>
      <textarea
          id="description"
          name="description"
          v-model="description"
          placeholder="Example: I want to get the reverse of a string"
          required
      />
      <label
          class="text-black dark:text-white text-2xl"
      >Examples*</label>
      <div
          v-for="(example, index) in examples"
          :key="index"
          class="flex flex-row items-center gap-2"
      >
        <input
            v-model="example.input"
            placeholder="Input"
            class="border-2 border-primary rounded-l p-2 w-[30%]"
            required
        />
        <input
            v-model="example.output"
            placeholder="Output"
            class="border-2 border-primary rounded-l p-2 w-[30%]"
            required
        />
        <input
            v-model="example.explanation"
            placeholder="Explanation"
            class="border-2 border-primary rounded-l p-2 w-[30%]"
        />
        <button
            type="button"
            @click="removeExample(index)"
            class="bg-red-500 text-white rounded p-2 disabled:opacity-50"
            :disabled="examples.length === 1"
        >
          ✕
        </button>
      </div>
      <button
          type="button"
          @click="addExample"
          class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Example
      </button>
      <label
          for="constraints"
          class="text-black dark:text-white text-2xl"
      >Constraints*</label>
      <textarea
          id="constraints"
          name="constraints"
          v-model="constraints"
          placeholder="Example: The input string will have at most length 1000"
      />
      <label
          for="languages"
          class="text-black dark:text-white text-2xl"
      >Allowed Languages*</label>
      <div class="w-full flex flex-row items-center justify-start gap-4">
        <div
            v-for="language in allowedLanguages"
            :key="language.name"
            class="flex flex-row gap-2 ps-4 bg-headline text-white rounded-xl p-4 flex-wrap"
        >
          <input
              :id="language.name"
              type="checkbox"
              :checked="isLanguageSelected(language)"
              @change="toggleLanguage(language)"
              class="accent-primary"
          >
          <label :for="language.name">{{ language.name }}</label>
        </div>
      </div>
      <label
          for="difficulties"
          class="text-black dark:text-white text-2xl"
      >Difficulty*</label>
      <div class="w-full flex flex-row items-center justify-start gap-4 text-black dark:text-white text-2xl">
        <select
            v-model="difficulty"
            class="p-2 border-2 border-primary rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option
              v-for="diff in difficulties"
              :key="diff"
              :value="diff"
              class="bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            {{ diff }}
          </option>
        </select>
      </div>
    </form>

    <!-- Code section -->
    <div
        class="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 transition-all"
        @mousedown="startDragging"
    />

    <div
        class="flex-1 h-full min-w-[200px] relative"
        data-aos="fade-left"
        data-aos-duration="3000"
    >
      <test-editor />
    </div>
  </section>

  <!-- Bottom NavBar -->
  <footer
      class="flex flex-row justify-center items-center w-full fixed h-16 bottom-0 bg-background dark:bg-bgdark gap-4"
  >
    <button-with-image
        title="Return back"
        image-url="/icons/back.svg"
        alt-text="Return back"
        @click="isBackDialogOpen = true"
    />
    <button-with-image
        title="Submit"
        image-url="/icons/upload.svg"
        alt-text="Submit codequest"
        @click="isQuestDialogOpen = true"
    />
  </footer>
</template>

<style scoped>
input,
textarea {
  @apply focus:outline-none p-2;
}

textarea {
  @apply min-h-24 h-2/5 max-h-fit border-2 border-primary w-2/5 rounded-l;
}
</style>

