<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {useRouter} from 'vue-router';
import type {
  AllowedTypeName,
  ExampleFieldErrors,
  FunctionExample,
  FunctionParameter,
  Language
} from "../utils/interface.ts";
import {addNewCodequest, generateCodequestCodes} from "../utils/api.ts";
import {getPlaceholder, isValidInput, isValidOutput} from "../utils/type-utils.ts";
import {errorToast, successToast} from "../utils/notify.ts";
import {codequestStore} from "../utils/codequest-store.ts";

const router = useRouter()
const codeQuestStore = codequestStore()

const title = ref(codeQuestStore.title)
const description = ref(codeQuestStore.description)
const constraints = ref(codeQuestStore.constraints)
const difficulty = ref(codeQuestStore.difficulty)
const languages = ref<Language[]>(codeQuestStore.languages)
const functionName = ref(codeQuestStore.functionName)
const parameters = ref<FunctionParameter[]>(codeQuestStore.parameters || [])
const returnType = ref<AllowedTypeName>(codeQuestStore.returnType)
const exampleErrors = ref<ExampleFieldErrors[]>([]);

const examples = ref([
  {
    inputs: parameters.value.map(() => ''),
    output: '',
    explanation: ''
  }
])

const canSubmit = computed(() => {
  return examples.value.every(example =>
      example.inputs.length === parameters.value.length &&
      example.inputs.every((input, i) => isValidInput(input, parameters.value[i].typeName)) &&
      isValidOutput(example.output, returnType.value)
  );
})

const submitCodequest = async () => {
  const nickname = sessionStorage.getItem('nickname');

  const examplesForAdd = examples.value.map(ex => ({
    input: ex.inputs.join(','),
    output: ex.output,
    explanation: ex.explanation,
  }));

  const response = await addNewCodequest(
      title.value,
      nickname!,
      {
        description: description.value,
        examples: examplesForAdd,
        constraints: constraints.value ? [constraints.value] : [],
      },
      languages.value,
      {
        name: difficulty.value,
      }
  );

  if (!response.success || !response.codequest.id) {
    await errorToast("Can't save codequest");
    return;
  }

  const examplesForGenerate: FunctionExample[] = examples.value.map(ex => ({
    inputs: ex.inputs,
    output: ex.output,
  }));

  const codegenRes = await generateCodequestCodes(
      response.codequest.id,
      functionName.value,
      parameters.value,
      returnType.value!,
      examplesForGenerate,
      languages.value.map(l => l.name)
  );

  if (!codegenRes.success) {
    await errorToast("Codequest saved, but failed to generate starter code");
    return;
  }

  codeQuestStore.$reset();
  await router.push('/profile');
  await successToast("CodeQuest created successfully!")
};

const addExample = () => {
  examples.value.push({
    inputs: parameters.value.map(() => ''),
    output: '',
    explanation: ''
  });
}

const removeExample = (index: number) => {
  examples.value.splice(index, 1);
}

const goBack = () => {
  router.back();
}

const proceed = async () => {
  if (!canSubmit.value) {
    await errorToast("Please complete all fields and fix any example errors before continuing.");
    return;
  }
  await submitCodequest();
}

watch(examples, () => {
  exampleErrors.value = examples.value.map(ex => {
    const inputsErrors = ex.inputs.map((input, i) =>
        isValidInput(input, parameters.value[i].typeName) ? null : `Input ${parameters.value[i].name} not valid`
    );
    const outputError = isValidOutput(ex.output, returnType.value) ? null : 'Output not valid';
    return {
      inputs: inputsErrors,
      output: outputError
    };
  });
}, { deep: true });

</script>
<template>
  <section class="p-6 bg-background dark:bg-bgdark text-black dark:text-white min-h-screen">
    <h1 class="text-2xl font-bold mb-6">
      Define Examples for <span class="text-primary">{{ functionName }}</span>
    </h1>

    <div
        v-for="(ex, index) in examples"
        :key="index"
        class="mb-6 border border-primary rounded-xl p-6 bg-white dark:bg-gray-900 shadow-md"
    >
      <h2 class="text-xl font-semibold mb-4 text-black dark:text-white">Example {{ index + 1 }}</h2>

      <div
          v-for="(param, pIndex) in parameters"
          :key="pIndex"
          class="mb-4"
      >
        <label class="block text-md font-medium text-black dark:text-white mb-1">
          {{ param.name }} ({{ param.typeName }})
        </label>
        <input
            v-model="ex.inputs[pIndex]"
            type="text"
            class="w-full border-2 border-primary rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none"
            :placeholder="getPlaceholder(param.typeName)"
        />
        <p v-if="exampleErrors[index] && exampleErrors[index].inputs.every(i => i)" class="text-error text-base">{{ exampleErrors[index].inputs[0] }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-md font-medium text-black dark:text-white mb-1">
          Expected Output ({{ returnType }})
        </label>
        <input
            v-model="ex.output"
            type="text"
            class="w-full border-2 border-primary rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none"
            :placeholder="getPlaceholder(returnType)"
        />
        <p v-if="exampleErrors[index]" class="text-error text-base">{{ exampleErrors[index].output }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-md font-medium text-black dark:text-white mb-1">
          Explanation (optional)
        </label>
        <textarea
            v-model="ex.explanation"
            class="w-full border-2 border-primary rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none"
            rows="3"
            placeholder="Explain why this is a valid example..."
        />
      </div>
      <button
          @click="removeExample(index)"
          class="text-sm text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>

    <button
        @click="addExample"
        class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition mb-8"
    >
      Add Example
    </button>

    <div class="flex gap-4">
      <button
          @click="goBack"
          class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition mb-8"
      >
        Back
      </button>
      <button
          @click="proceed"
          class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition mb-8"
      >
        Continue
      </button>
    </div>
  </section>
</template>