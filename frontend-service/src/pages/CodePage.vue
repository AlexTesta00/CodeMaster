<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import CodeEditor from '../components/CodeEditor.vue'
import ClickableTextWithImage from '../components/ClickableTextWithImage.vue'
import SideBar from '../components/SideBar.vue'
import TextareaCodeLanguages from '../components/TextareaCodeLanguages.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import router from '../router'
import {errorToast} from "../utils/notify.ts";
import {getAllCodequests, getCodequestById, getSolutionsByCodequest} from "../utils/api.ts";
import {useAuthStore} from "../utils/store.ts";
import type {CodeQuest, Example, Language} from "../utils/interface.ts";
import {useRoute} from "vue-router";

const currentLanguage = ref<Language>({
  name: 'Java',
  version: '17',
  fileExtension: '.java'
})

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
const auth = useAuthStore()
const codequests = ref<CodeQuest[]>([])

const isBackDialogOpen = ref(false)
const route = useRoute()

const markDown = ref('')
const code = ref('')

const codequest = ref<CodeQuest | null>(null)

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

const getExamples = (examples: Example[]): string => {
  return examples
      .map((example, index) => {
        const explanation = example.explanation
            ? `Explanation: ${example.explanation}`
            : ''

        return `### ${index + 1}.
**Input**:
\`${example.input}\`

**Output**:
\`${example.output}\`

${explanation}`
      })
      .join('\n\n')
}

const getConstraints = (constraints: string[]): string => {
  return constraints.map(c => `- ${c}`).join('\n')
}


const buildMarkDown = (codequest: CodeQuest): string => {
  return `# ${codequest.title}

## Problem
${codequest.problem.description}

## Examples
${getExamples(codequest.problem.examples)}

## Constraints
${getConstraints(codequest.problem.constraints)}

## Difficulty
${codequest.difficulty.name}

## Author
${codequest.author}`
}


onMounted(async () => {
  const id = route.params.id?.toString()

  if (auth.nickname && id) {
    try {
      const solRes = await getSolutionsByCodequest(id)
      if(solRes.success){
        const sol = solRes.solutions.find(sol => sol.user === auth.nickname)
        if(sol) {
          currentLanguage.value = sol.language
          code.value = sol.code
        }
      }
      const res = await getCodequestById(id)
      if(res.success) {
        markDown.value = buildMarkDown(res.codequest)
        codequest.value = res.codequest
      }
    } catch (error) {
      await errorToast('Impossible to load codequests')
      console.log(error)
    }
  } else {
    await errorToast('Impossible to load codequest')
  }
})

onMounted( async () => {
  if(auth.nickname) {
    try{
      const res = await getAllCodequests()
      if(res.success) {
        for (const quest of res.codequests) {
          codequests.value.push(quest)
        }
      }
    } catch (error) {
      await errorToast('Impossible to load codequests')
      console.log(error)
    }
  }
})

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
      :codequest="codequests"
    />

    <!-- Markdown Section -->
    <div
      :style="{ width: leftPanelWidth + 'px' }"
      class="h-full overflow-auto min-w-[200px] max-w-[calc(100%-200px)] mt-6"
      data-aos="fade-up"
      data-aos-duration="1600"
    >
      <markdown-viewer
        :content="markDown"
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
          :allowed-language="allowedLanguages"
          :current-language="currentLanguage"
          @language-selected="currentLanguage = $event"
        />
      </div>
      <code-editor
        v-if="auth.nickname && codequest"
        class="w-full h-full"
        :current-language="currentLanguage"
        :codequest="codequest"
        :old-code="code"
        :user="auth.nickname"
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
        alt="Open sidebar to view all codequests"
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
