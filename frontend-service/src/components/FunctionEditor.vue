<script setup lang="ts">
import { ref, watch } from 'vue'
import type {AllowedTypeName, FunctionExample, FunctionParameter} from "../utils/interface.ts";
import {isValidIdentifier, primitiveTypes} from "../utils/type-utils.ts";

const emit = defineEmits<{
  (e: 'update:function', value: {
    functionName: string
    parameters: FunctionParameter[]
    returnType: AllowedTypeName
  }): void
  (e: 'update:valid', valid: boolean): void
}>()

const functionName = ref('')
const parameters = ref<FunctionParameter[]>([
  { name: '', typeName: 'int' }
])
const returnType = ref<AllowedTypeName>('int')
const examples = ref<FunctionExample[]>([
  { inputs: [], output: '' }
])

const allowedTypes = [
  ...primitiveTypes
] as const

const errors = ref<{
  functionName?: string
  parameters: (string | undefined)[]
}>({
  parameters: [],
})

const validate = () => {
  let valid = true

  const nameSet = new Set<string>()

  if (!functionName.value.trim()) {
    errors.value.functionName = 'Function name is required.'
    valid = false
  } else if (!isValidIdentifier(functionName.value)) {
    errors.value.functionName = 'Invalid function name. CamelCase, no spaces, no digits first.'
    valid = false
  } else {
    errors.value.functionName = undefined
  }

  if (parameters.value.length === 0) {
    errors.value.parameters = ['At least one parameter is required.']
    valid = false
  } else {
    errors.value.parameters = parameters.value.map((param) => {
      const name = param.name.trim()
      if (!name) return 'Parameter name is required.'
      if (!isValidIdentifier(name)) return 'Invalid parameter name. CamelCase, no spaces, no digits first.'
      if (name === functionName.value.trim()) {
        valid = false
        return 'Parameter name must be different from function name.'
      }
      if (nameSet.has(name)) {
        valid = false
        return 'Duplicate parameter name.'
      }
      nameSet.add(name)
      return undefined
    })
    if (errors.value.parameters.some(e => e !== undefined)) valid = false
  }

  emit('update:valid', valid)
  return valid
}

watch(parameters, () => {
  examples.value.forEach(e => {
    while (e.inputs.length < parameters.value.length) {
      const idx = e.inputs.length
      const t = parameters.value[idx]?.typeName || 'int'
      let defaultVal = ''
      if (t.startsWith('int') || t.startsWith('double')) defaultVal = '0'
      else if (t.startsWith('boolean')) defaultVal = 'false'
      else defaultVal = ''
      e.inputs.push(defaultVal)
    }
    while (e.inputs.length > parameters.value.length) e.inputs.pop()
  })
}, { deep: true })

watch([functionName, parameters, returnType], () => {
  validate()
  emit('update:function', {
    functionName: functionName.value,
    parameters: parameters.value,
    returnType: returnType.value
  })
}, { deep: true })

const addParameter = () => {
  parameters.value.push({ name: '', typeName: 'int' })
}

const removeParameter = (index: number) => {
  parameters.value.splice(index, 1)
}

</script>

<template>
    <label class="text-black dark:text-white text-2xl">Function Signature*</label>
    <input
        v-model="functionName"
        placeholder="Function name"
        class="border-2 border-primary w-2/5 rounded-l"
        required
    />
    <p v-if="errors.functionName" class="text-error text-base">{{ errors.functionName }}</p>
    <label class="text-black dark:text-white text-2xl">Parameters*</label>
  <div v-for="(param, index) in parameters" :key="index" class="flex flex-col gap-1 mb-4">
    <div class="flex gap-2 items-center">
      <input
          v-model="param.name"
          placeholder="Parameter name"
          class="border-2 border-primary w-2/5 rounded-l"
          required
      />
      <select
          v-model="param.typeName"
          class="p-2 border-2 border-primary rounded-md dark:bg-gray-800 text-black dark:text-white"
      >
        <option v-for="type in allowedTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <button
          v-if="parameters.length > 1"
          type="button"
          @click="removeParameter(index)"
          class="p-2 rounded hover:bg-red-200 dark:hover:bg-red-700 dark:text-white"
          aria-label="Remove parameter"
      >
        <img src="/icons/trashcan.svg" alt="Remove" class="w-5 h-5 dark:text-white" />
      </button>
    </div>
    <p v-if="errors.parameters[index]" class="text-error text-base ml-1">
      {{ errors.parameters[index] }}
    </p>
  </div>
  <button
        type="button"
        @click="addParameter"
        class="inline-flex items-center p-2 rounded bg-primary hover:bg-blue-600 text-white w-fit"
        aria-label="Add parameter"
    >
    Add parameter
    </button>
    <label for="allowedTypes" class="text-black dark:text-white text-2xl">Return Type*</label>
    <div class="w-full flex flex-row items-center justify-start gap-4 text-black dark:text-white text-2xl">
      <select
          v-model="returnType"
          class="p-2 border-2 border-primary rounded-md dark:bg-gray-800 text-black dark:text-white"
      >
        <option v-for="type in allowedTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
    </div>
</template>
<style scoped>
input {
  @apply focus:outline-none p-2;
}
</style>