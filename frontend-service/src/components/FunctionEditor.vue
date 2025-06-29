<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FunctionExample, FunctionParameter } from "../utils/interface.ts";

const emit = defineEmits<{
  (e: 'update:function', value: {
    functionName: string
    parameters: FunctionParameter[]
    returnType: AllowedTypeName
  }): void
}>()

const functionName = ref('')
const parameters = ref<FunctionParameter[]>([
  { name: '', typeName: 'int' }
])
const returnType = ref<AllowedTypeName>('int')
const examples = ref<FunctionExample[]>([
  { inputs: [], output: '' }
])

const simpleTypes = ['int', 'string', 'boolean', 'double', 'long', 'float'] as const

const listTypes = simpleTypes.map(t => `List<${t}>` as const)
const mapTypes = simpleTypes.flatMap(keyType =>
    simpleTypes.map(valueType => `Map<${keyType},${valueType}>` as const)
)

const allowedTypes = [
  ...simpleTypes,
  ...listTypes,
  ...mapTypes,
] as const
type AllowedTypeName = (typeof allowedTypes)[number]

const addParameter = () => {
  parameters.value.push({ name: '', typeName: 'int' })
}

const removeParameter = (index: number) => {
  parameters.value.splice(index, 1)
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

watch([functionName, parameters, returnType, examples], () => {
  emit('update:function', {
    functionName: functionName.value,
    parameters: parameters.value,
    returnType: returnType.value
  })
}, { deep: true })
</script>
<template>
  <div class="flex flex-col gap-4 text-black dark:text-white">
    <label class="text-black dark:text-white text-2xl">Function Signature*</label>
    <input
        v-model="functionName"
        placeholder="Function name"
        class="p-2 border-2 border-primary rounded-md bg-white text-black"
        required
    />

    <label class="text-black dark:text-white text-2xl">Parameters*</label>
    <div v-for="(param, index) in parameters" :key="index" class="flex gap-2 items-center">
      <input
          v-model="param.name"
          placeholder="Parameter name"
          class="p-2 border-2 border-primary rounded-md bg-white text-black"
          required
      />
      <select
          v-model="param.typeName"
          class="p-2 border-2 border-primary rounded-md bg-white text-black"
      >
        <option v-for="type in allowedTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <button
          type="button"
          @click="removeParameter(index)"
          class="p-2 rounded hover:bg-red-200 dark:hover:bg-red-700"
          aria-label="Remove parameter"
      >
        <img src="/icons/trashcan.svg" alt="Remove" class="w-5 h-5" />
      </button>
    </div>

    <button
        type="button"
        @click="addParameter"
        class="inline-flex items-center p-2 rounded bg-primary hover:bg-blue-600 text-white w-fit"
        aria-label="Add parameter"
    >
      <img src="/icons/add.svg" alt="Add" class="w-5 h-5" />
    </button>

    <label for="allowedTypes" class="text-black dark:text-white text-2xl">Return Type*</label>
    <div class="w-full flex flex-row items-center justify-start gap-4 text-black dark:text-white text-2xl">
      <select
          v-model="returnType"
          class="p-2 border-2 border-primary rounded-md bg-white text-black"
      >
        <option v-for="type in allowedTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
    </div>
  </div>
</template>


