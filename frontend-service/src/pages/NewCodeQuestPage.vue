<script setup lang="ts">
import {onMounted, ref} from 'vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'
import type {AllowedTypeName, FunctionParameter, Language} from "../utils/interface.ts";
import FunctionEditor from "../components/FunctionEditor.vue";
import {useRouter} from "vue-router";
import {codequestStore} from "../utils/codequest-store.ts";
import {errorToast} from "../utils/notify.ts";

const router = useRouter()
const codeQuestStore = codequestStore()

const title = ref(codeQuestStore.title || '')
const description = ref(codeQuestStore.description || '')
const constraints = ref(codeQuestStore.constraints ||'')
const titleError = ref<string | null>(null)
const descriptionError = ref<string | null>(null)
const constraintsError = ref<string | null>(null)
const functionName = ref(codeQuestStore.functionName ||'')
const parameters = ref<FunctionParameter[]>(codeQuestStore.parameters)
const returnType = ref<AllowedTypeName>(codeQuestStore.returnType || 'int')
const isFunctionValid = ref(false)

const isBackDialogOpen = ref(false)
const isQuestDialogOpen = ref(false)

const allowedLanguages = ref<Language[]>([
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
const languages = ref<Language[]>([allowedLanguages.value[0]])
const difficulties = ref(['EASY', 'MEDIUM', 'HARD'])
const difficulty = ref(difficulties.value[0])

const isLanguageSelected = (lang: Language): boolean => {
  return languages.value.some(l => l.name === lang.name)
}

const toggleLanguage = (lang: Language) => {
  const exists = isLanguageSelected(lang)
  if (exists) {
    languages.value = languages.value.filter(l => l.name !== lang.name)
  } else {
    languages.value.push(lang)
  }
}

const validateTitle = () => {
  titleError.value = title.value.trim() === '' ? 'Title can\'t be empty' : null
}

const validateDescription = () => {
  descriptionError.value = description.value.trim() === '' ? 'Description can\'t be empty' : null
}

const validateConstraints = () => {
  constraintsError.value = constraints.value.trim() === '' ? 'Constraints can\'t be empty' : null
}

const handleFunctionUpdate = (data: {
  functionName: string
  parameters: FunctionParameter[]
  returnType: AllowedTypeName
}) => {
  functionName.value = data.functionName
  parameters.value = data.parameters
  returnType.value = data.returnType
}

const handleConfirm = async () => {
  validateTitle()
  validateDescription()
  validateConstraints()

  if (titleError.value || descriptionError.value || constraintsError.value || !isFunctionValid.value) {
    return
  }

  if (!isFunctionValid.value) {
    await errorToast('Function signature contains errors')
    return
  }

  if (languages.value.length === 0) {
    await errorToast('At least one language must be selected')
    return
  }

  isBackDialogOpen.value = false
  codeQuestStore.setCodeQuestData({
    title: title.value,
    description: description.value,
    difficulty: difficulty.value,
    constraints: constraints.value,
    languages: languages.value,
    functionName: functionName.value,
    parameters: parameters.value,
    returnType: returnType.value,
  })
  await router.push('/examples')
}

const handleBack = () => {
  codeQuestStore.$reset();
  isBackDialogOpen.value = false
  router.push('/dashboard')
}

const handleClose = () => {
  isBackDialogOpen.value = false
}

const handleQuestClose = () => {
  isQuestDialogOpen.value = false
}

const validateForm = (): boolean => {
  return (
      title.value.trim() !== '' &&
      description.value.trim() !== '' &&
      constraints.value.trim() !== '' &&
      languages.value.length > 0 &&
      isFunctionValid.value
  )
}

onMounted(() => {
  if (codeQuestStore.title) title.value = codeQuestStore.title
  if (codeQuestStore.description) description.value = codeQuestStore.description
  if (codeQuestStore.constraints) constraints.value = codeQuestStore.constraints
  if (codeQuestStore.languages.length > 0) languages.value = [...codeQuestStore.languages]
  if (codeQuestStore.functionName) functionName.value = codeQuestStore.functionName
  if (codeQuestStore.parameters.length > 0) parameters.value = [...codeQuestStore.parameters]
  if (codeQuestStore.returnType) returnType.value = codeQuestStore.returnType
  if (codeQuestStore.difficulty) difficulty.value = codeQuestStore.difficulty
})

</script>

<template>
  <section
      class="h-[100vh] flex flex-row bg-background dark:bg-bgdark animate-fade-in overflow-hidden"
  >
    <yes-or-no-dialog
        title="Are you sure?"
        message="Changes will not be saved and the codequest will not be forwarded"
        :is-open-dialog="isBackDialogOpen"
        @confirm="handleBack"
        @close="handleClose"
    />

    <yes-or-no-dialog
        title="Are you sure?"
        message="You will proceed to examples page"
        :is-open-dialog="isQuestDialogOpen"
        @confirm="handleConfirm"
        @close="handleQuestClose"
    />

    <form
        :style="{ width: '50%' }"
        class="flex h-full flex-col overflow-auto gap-4 pb-16 ml-4"
        data-aos="fade-up"
        data-aos-duration="3000"
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
          @blur="validateTitle"
          :aria-invalid="!!titleError"
          class="border-2 border-primary w-2/5 rounded-l"
          placeholder="Example: Reverse string"
          required
      >
      <p v-if="titleError" class="text-red-500 text-sm mt-1">{{ titleError }}</p>
      <label
          for="description"
          class="text-black dark:text-white text-2xl"
      >Description*</label>
      <textarea
          id="description"
          name="description"
          v-model="description"
          @blur="validateDescription"
          :aria-invalid="!!descriptionError"
          placeholder="Example: I want to get the reverse of a string"
          class="border-2 border-primary w-2/5 rounded-l"
          required
      />
      <p v-if="descriptionError" class="text-red-500 text-sm mt-1">{{ descriptionError }}</p>
      <label
          for="constraints"
          class="text-black dark:text-white text-2xl"
      >Constraints*</label>
      <textarea
          id="constraints"
          name="constraints"
          v-model="constraints"
          @blur="validateConstraints"
          :aria-invalid="!!constraintsError"
          placeholder="Example: The input string will have at most length 1000"
          required
      />
      <p v-if="constraintsError" class="text-red-500 text-sm mt-1">{{ constraintsError }}</p>
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
            class="p-2 border-2 border-primary rounded-md dark:bg-gray-800 text-black dark:text-white"
        >
          <option
              v-for="diff in difficulties"
              :key="diff"
              :value="diff"
          >
            {{ diff }}
          </option>
        </select>
      </div>
    </form>
    <form
        :style="{ width: '50%' }"
        class="flex h-full flex-col overflow-auto gap-4 pb-16 ml-4"
        data-aos="fade-up"
        data-aos-duration="3000"
    >
      <function-editor
          @update:function="handleFunctionUpdate"
          v-model:valid="isFunctionValid"
      />
    </form>
  </section>
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
        title="Next"
        image-url="/icons/upload.svg"
        alt-text="Go Next"
        @click="() => { if (validateForm()) isQuestDialogOpen = true }"
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

