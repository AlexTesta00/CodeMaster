<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import CodeEditor from '../components/CodeEditor.vue'
import ClickableTextWithImage from '../components/ClickableTextWithImage.vue'
import SideBar from '../components/SideBar.vue'
import TextareaCodeLanguages from '../components/TextareaCodeLanguages.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import router from '../router'
import {errorToast, successToast} from "../utils/notify.ts";
import {
  addNewSolution, debugCode, executeCode,
  getAllCodequests,
  getCodequestById,
  getGeneratedCodes,
  getSolutionsByCodequest
} from "../utils/api.ts";
import {useAuthStore} from "../utils/store.ts";
import type {CodeQuest, Codes, ExecutionResult, Solution} from "../utils/interface.ts";
import {useRoute} from "vue-router";
import ExecutionResultPanel from "../components/ExecutionResultPanel.vue";

const availableLanguages = ref<Codes[]>([])
const currentLanguage = ref<Codes>()
const originalCodes = ref<Codes[]>([])
const solution = ref<Solution>()
const auth = useAuthStore()
const codequests = ref<CodeQuest[]>([])

const isBackDialogOpen = ref(false)
const route = useRoute()

const result = ref<ExecutionResult>()
const codequest = ref<CodeQuest | null>(null)
const currentCode = ref('')
const isExecuting = ref(false)
const isTerminalOpen = ref(false)
const executionType = ref('')

const addSolution = async () => {
  try {
    if (auth.nickname && codequest.value) {
      const codes = codequest.value.languages.map(lang => {
        const matched = availableLanguages.value.find(l => l.language === lang.name)
        if (!matched) {
          throw new Error(`No code found for language ${lang.name}`)
        }
        return {
          language: {
            name: lang.name,
            fileExtension: lang.fileExtension
          },
          code: matched.templateCode
        }
      })
      return await addNewSolution(
          auth.nickname,
          codequest.value.id,
          codes,
          false,
      )
    }
  } catch(error) {
    await errorToast('Impossible to add solution')
    console.log(error)
  }
}

const handleConfirm = async () => {
  isBackDialogOpen.value = false
  await router.push('/dashboard')
}

const debug = async () => {
  executionType.value = 'compile'
  try {
    isTerminalOpen.value = true
    isExecuting.value = true
    result.value = undefined

    if(!solution.value) {
      const response = await addSolution()
      if (response && response.success) {
        solution.value = response.solution
      } else {
        await errorToast('Error while adding solution')
        return
      }
    }
    if (availableLanguages.value && currentLanguage.value && solution.value) {
      const lang = currentLanguage.value.language
      const testCode = availableLanguages.value.find(l => l.language === lang)?.testCode
      const languageCode = solution.value.codes.find(code => code.language.name == lang)
      if (testCode && languageCode) {
        const response = await debugCode(
            solution.value.id,
            testCode,
            {
              language: languageCode.language,
              code: currentCode.value
            }
        )
        console.log('debug response: ', JSON.stringify(response, null, 2))
        if (response.success) {
          result.value = response.result
        }
      }
    }
  } catch {
    await errorToast('Error while compiling code')
  } finally {
    isExecuting.value = false
  }
}

const submit = async () => {
  executionType.value = 'run'
  try {
    isTerminalOpen.value = true
    isExecuting.value = true
    result.value = undefined

    if (!solution.value) {
      const response = await addSolution()
      if (response?.success) {
        solution.value = response.solution
      } else {
        await errorToast('Error while adding solution')
        return
      }
    }

    if (availableLanguages.value && currentLanguage.value && solution.value) {
      const lang = currentLanguage.value.language
      const testCode = availableLanguages.value.find(l => l.language === lang)?.testCode
      const languageCode = solution.value.codes.find(code => code.language.name == lang)
      if (testCode && languageCode) {
        const response = await executeCode(
            solution.value.id,
            testCode,
            {
              language: languageCode.language,
              code: currentCode.value
            }
        )
        console.log('execute response: ', JSON.stringify(response, null, 2))
        if (response.success) {
          result.value = response.result
        }
      }
    }
  } catch {
    await errorToast('Error while compiling code')
  } finally {
    isExecuting.value = false
  }
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

onMounted(async () => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDragging)

  const id = route.params.id?.toString()

  if (auth.nickname) {
    try {
      const res = await getAllCodequests()
      if (res.success) {
        codequests.value = res.codequests
      }

      if (id) {
        const questRes = await getCodequestById(id)
        if (questRes.success) {
          codequest.value = questRes.codequest

          const solRes = await getSolutionsByCodequest(id)
          const codeRes = await getGeneratedCodes(id)
          solution.value = solRes.solutions.find(sol => sol.user === auth.nickname)
          if (solRes.success && solution.value && codeRes.success) {
            availableLanguages.value = solution.value.codes.map(code => {
              const matched = codeRes.generatedCodes.entries.find(langCode => langCode.language == code.language.name)
              if (!matched) {
                throw new Error(`No code found for language ${code.language.name}`)
              }
              return {
                language: code.language.name,
                templateCode: code.code,
                testCode: matched.testCode
              }
            })
            originalCodes.value = availableLanguages.value.map(code => ({
              language: code.language,
              templateCode: code.templateCode,
              testCode: code.testCode
            }))
            currentLanguage.value = availableLanguages.value[0]
          } else {
            if (codeRes.success) {
              availableLanguages.value = codeRes.generatedCodes.entries
              currentLanguage.value = availableLanguages.value[0]
              originalCodes.value = availableLanguages.value.map(code => ({
                language: code.language,
                templateCode: code.templateCode,
                testCode: code.testCode
              }))
            }
          }
        }
      } else {
        await errorToast('Impossible to load codequest')
      }
    } catch (error) {
      await errorToast('Impossible to load codequests')
      console.error(error)
    }
  }
})

const resetCurrentCode = () => {
  if (currentLanguage.value) {
    const original = originalCodes.value.find(l => l.language === currentLanguage.value!.language)
    console.log('original codes: ', JSON.stringify(original, null, 2))
    if (original) {
      const idx = availableLanguages.value.findIndex(l => l.language === currentLanguage.value!.language)
      console.log('idx: ', JSON.stringify(original, null, 2))
      if (idx !== -1) {
        availableLanguages.value[idx].templateCode = original.templateCode
        currentLanguage.value = {
          ...availableLanguages.value[idx]
        }
        currentCode.value = original.templateCode
      }
    }
  }
}

const copyLink = async () => {
  const fullUrl = `${window.location.origin}/codequest/${codequest.value?.id}`
  try {
    await navigator.clipboard.writeText(fullUrl)
    await successToast('Link copied in clipboard')
  } catch (e) {
    console.error('Errore nella copia:', e)
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopDragging)
})

watch(currentLanguage, (newLang) => {
  if (newLang) {
    currentCode.value = newLang.templateCode || ''
  } else {
    currentCode.value = ''
  }
}, { immediate: true })

watch(currentCode, (newCode) => {
  if (!currentLanguage.value) return

  const idx = availableLanguages.value.findIndex(l => l.language === currentLanguage.value?.language)
  if (idx !== -1) {
    if (availableLanguages.value[idx].templateCode !== newCode) {
      availableLanguages.value[idx].templateCode = newCode
      if (currentLanguage.value !== availableLanguages.value[idx]) {
        currentLanguage.value = availableLanguages.value[idx]
      }
    }
  }
})

</script>

<template>
  <section
      class="h-[90vh] min-h-screen flex flex-row bg-background dark:bg-bgdark mx-4 overflow-hidden animate-fade-in"
  >
    <yes-or-no-dialog
        title="Are you sure?"
        message="Changes will be lost"
        :is-open-dialog="isBackDialogOpen"
        @confirm="handleConfirm"
        @close="handleClose"
    />

    <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
        @click="isSidebarOpen = false"
    />

    <side-bar
        v-if="isSidebarOpen"
        :codequest="codequests"
    />

    <div
        :style="{ width: leftPanelWidth + 'px' }"
        class="h-full overflow-auto min-w-[200px] max-w-[calc(100%-200px)] mt-6"
        data-aos="fade-up"
        data-aos-duration="1600"
    >
      <markdown-viewer
          v-if="codequest"
          :codequest="codequest"
          class="w-full h-full"
      />
    </div>

    <div
        class="flex-1 h-full min-w-[200px] flex flex-col relative"
        data-aos="fade-left"
        data-aos-duration="3000"
    >
      <div
          class="w-2 cursor-ew-resize absolute left-0 top-0 bottom-0 z-20"
          @mousedown="startDragging"
      />

      <div class="absolute top-4 right-4 z-10">
        <textarea-code-languages
            v-if="currentLanguage"
            :available-languages="availableLanguages"
            :current-language="currentLanguage"
            @language-selected="currentLanguage = $event"
        />
      </div>

      <div class="flex-1 overflow-hidden">
        <code-editor
            v-if="auth.nickname && codequest && currentLanguage"
            v-model="currentCode"
            :language="currentLanguage.language"
            v-model:value="currentCode"
            class="h-full"
        />
      </div>
      <div
          v-if="isTerminalOpen"
          class="h-60 bg-gray-200 dark:bg-gray-700 overflow-y-auto"
      >
        <div class="p-4">
          <div v-if="isExecuting" class="flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <span>Running code...</span>
          </div>
          <execution-result-panel
              v-else-if="result && codequest"
              :result="result"
              :examples="codequest.problem.examples"
              :execution-type="executionType"
          />
        </div>
      </div>
      <footer class="h-20 w-full z-20">
        <div class="w-full h-full bg-primary rounded-sm flex flex-row justify-evenly items-center flex-wrap">
          <clickable-text-with-image
              title="Share"
              url="/icons/share.svg"
              alt="Share codequest"
              @click="copyLink"
          />
          <clickable-text-with-image
              title="Reset"
              url="/icons/reset.svg"
              alt="Reset current code"
              @click="resetCurrentCode"
          />
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
              @click="debug"
          />
          <clickable-text-with-image
              title="Submit"
              url="/icons/upload.svg"
              alt="Upload your solution"
              @click="submit"
          />
        </div>
      </footer>
    </div>
  </section>
</template>