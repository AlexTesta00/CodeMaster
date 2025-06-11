<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import CodeEditor from '../components/CodeEditor.vue'
import ClickableTextWithImage from '../components/ClickableTextWithImage.vue'
import SideBar from '../components/SideBar.vue'
import TextareaCodeLanguages from '../components/TextareaCodeLanguages.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import router from '../router'

const codequest = [
    { title: '1.Reverse String', difficulty: 'easy' },
    { title: '2.Reverse Integer', difficulty: 'medium' },
    { title: '3.Reverse Words', difficulty: 'hard' },
    { title: '4.Reverse Array', difficulty: 'easy' },
    { title: '5.Reverse Linked List', difficulty: 'medium' },
    { title: '6. Fibonacci', difficulty: 'hard' },
]

const currentLanguage = ref('Java')

const markdownText = `
# 1. Reverse String
## Problem
Given a string, return the string reversed.
## Example
Input: "hello"
Output: "olleh"
## Constraints
* The input string will have at most length 1000.
* The input string will only contain printable ASCII characters.
`

const isBackDialogOpen = ref(false)

const handleConfirm = () => {
    isBackDialogOpen.value = false
    router.push('/dashboard')
}

const handleClose = () => {
    isBackDialogOpen.value = false
}

const leftPanelWidth = ref(
    parseInt(localStorage.getItem('leftPanelWidth') || '500'),
)
let isDragging = false
const isSidebarOpen = ref(false)

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
    class="h-[90vh] min-h-screen flex flex-row bg-background dark:bg-bgdark mx-4 overflow-hidden animate-fade-in"
  >
    <!-- Dialog for return back -->
    <yes-or-no-dialog
      title="Are you sure?"
      message="Changes will not be saved and the codequest will not be forwarded"
      :is-open-dialog="isBackDialogOpen"
      @confirm="handleConfirm"
      @close="handleClose"
    />

    <!-- Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar Overlay -->
    <side-bar
      v-if="isSidebarOpen"
      :codequest="codequest"
    />

    <!-- Markdown Section -->
    <div
      :style="{ width: leftPanelWidth + 'px' }"
      class="h-full overflow-auto min-w-[200px] max-w-[calc(100%-200px)] mt-6"
      data-aos="fade-up"
      data-aos-duration="1600"
    >
      <markdown-viewer
        :content="markdownText"
        class="w-full h-full"
      />
    </div>

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
      <div class="absolute top-4 right-4 z-10">
        <textarea-code-languages
          :allowed-language="['Java', 'Python', 'Scala', 'Kotlin']"
          @language-selected="currentLanguage = $event"
        />
      </div>
      <code-editor
        class="w-full h-full"
        :current-language="currentLanguage"
      />
    </div>
  </section>

  <!-- Bottom NavBar -->
  <footer
    class="flex flex-row justify-center items-center w-full h-16 fixed bottom-0 mb-7 bg-transparent"
  >
    <div
      class="w-1/4 h-full bg-primary rounded-full flex flex-row justify-evenly items-center flex-wrap"
    >
      <clickable-text-with-image
        title="Codequest"
        url="/icons/dot.svg"
        alt="Open sidebar to view all codequest"
        @click="isSidebarOpen = true"
      />
      <clickable-text-with-image
        title="Home"
        url="/icons/home.svg"
        alt="Return to home"
        @click="isBackDialogOpen = true"
      />
      <clickable-text-with-image
        title="Debug"
        url="/icons/debug.svg"
        alt="Debug your solution"
      />
      <clickable-text-with-image
        title="Submit"
        url="/icons/upload.svg"
        alt="Upload your solution"
      />
    </div>
  </footer>
</template>
