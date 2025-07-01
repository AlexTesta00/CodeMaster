<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import CodeEditor from '../components/CodeEditor.vue'
import ClickableTextWithImage from '../components/ClickableTextWithImage.vue'
import SideBar from '../components/SideBar.vue'
import TextareaCodeLanguages from '../components/TextareaCodeLanguages.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import router from '../router'
import {errorToast} from "../utils/notify.ts";
import {
  addNewSolution, debugCode, executeCode,
  getAllCodequests,
  getCodequestById,
  getGeneratedCodes,
  getSolutionsByCodequest, updateSolution
} from "../utils/api.ts";
import {useAuthStore} from "../utils/store.ts";
import type {CodeQuest, Codes, ExecutionResult, LanguageCodes, Solution} from "../utils/interface.ts";
import {useRoute} from "vue-router";
import ExecutionResultPanel from "../components/ExecutionResultPanel.vue";

const availableLanguages = ref<Codes[]>([])
const currentLanguage = ref<Codes>()
const solution = ref<Solution>()
const auth = useAuthStore()
const codequests = ref<CodeQuest[]>([])

const isBackDialogOpen = ref(false)
const route = useRoute()

const result = ref<ExecutionResult>()
const codequest = ref<CodeQuest | null>(null)
const currentCode = ref('')

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
    try {
      if(auth.nickname && codequest.value) {
        if (solution.value) {
          const languageCodes: LanguageCodes[] = codequest.value.languages.map(lang => {
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
          for (const code of languageCodes) {
            await updateSolution(
                solution.value.id,
                code
            )
          }
        } else {
          await addSolution()
        }
      }
    } catch (error) {
      await errorToast('Impossible to load solution')
      console.log(error)
    }
    isBackDialogOpen.value = false
    await router.push('/dashboard')
}

const debug = async () => {
  try {
    if(!solution.value) {
      const response = await addSolution()
      if (response && response.success) {
        solution.value = response.solution
      } else {
        await errorToast('Error while adding solution')
      }
    }
    if (availableLanguages.value && currentLanguage.value && solution.value) {
      const lang = currentLanguage.value.language
      const testCode = availableLanguages.value.find(l => l.language === lang)?.testCode
      if (testCode) {
        const languageCode = solution.value.codes.find(code => code.language.name == lang)
        if (languageCode) {
          const response = await debugCode(
              solution.value.id,
              testCode,
              languageCode
          )
          console.log('solution resp: ', JSON.stringify(response, null, 2))
          if (response.success) {
            result.value = response.result
          }
        }
      }
    }
  } catch {
    await errorToast('Error while compiling code')
  }
}

const submit = async () => {
  try {
    if(!solution.value) {
      const response = await addSolution()
      if (response && response.success) {
        solution.value = response.solution
      } else {
        await errorToast('Error while adding solution')
      }
    }
    if (availableLanguages.value && currentLanguage.value && solution.value) {
      const lang = currentLanguage.value.language
      const testCode = availableLanguages.value.find(l => l.language === lang)?.testCode
      if (testCode) {
        const languageCode = solution.value.codes.find(code => code.language.name == lang)
        if (languageCode) {
          const response = await executeCode(
              solution.value.id,
              testCode,
              languageCode
          )
          console.log('solution resp: ', JSON.stringify(response, null, 2))
          if (response.success) {
            result.value = response.result
          }
        }
      }
    }
  } catch {
    await errorToast('Error while compiling code')
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
            currentLanguage.value = availableLanguages.value[0]
          } else {
            if (codeRes.success) {
              availableLanguages.value = codeRes.generatedCodes.entries
              currentLanguage.value = availableLanguages.value[0]
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
    availableLanguages.value[idx].templateCode = newCode
    currentLanguage.value = availableLanguages.value[idx]
  }
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
          v-if="codequest"
          :codequest="codequest"
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
            v-if="currentLanguage"
            :available-languages="availableLanguages"
            :current-language="currentLanguage"
            @language-selected="currentLanguage = $event"
        />
      </div>
      <code-editor
          v-if="auth.nickname && codequest && currentLanguage"
          :current-language="currentLanguage"
          :examples="codequest.problem.examples"
          v-model:value="currentCode"
      />
      <execution-result-panel
        v-if="result && codequest"
        :result="result"
        :examples="codequest.problem.examples"
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
</template>
