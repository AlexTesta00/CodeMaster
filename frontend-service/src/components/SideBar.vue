<script setup lang="ts">
import DifficultyButton from './DifficultyButton.vue'
import type {CodeQuest} from "../utils/interface.ts";

defineProps<{
    codequest: CodeQuest[]
}>()

const emit = defineEmits<{
  (e: 'expand:id', id: string): void
}>()

const handleClick = (id: string) => emit('expand:id', id)

</script>

<template>
  <aside
    class="flex flex-col w-1/5 h-screen px-4 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:border-gray-700 absolute top-0 left-0 z-40 dark:text-white dark:bg-bgdark"
    data-aos="fade-right"
    data-aos-duration="1400"
  >
    <img
      class="w-16 h-16"
      src="/icons/logo.png"
      alt="Codemaster logo"
    >
    <ul
      class="w-full h-full flex flex-col justify-start items-start gap-4 ml-4"
    >
      <div
        v-for="quest in codequest"
        :key="quest.title"
        class="w-4/5 flex flex-row justify-between items-end gap-4"
      >
        <li
            class="mt-6 cursor-pointer"
            @click="handleClick(quest.id)"
        >
          {{ quest.title }}
        </li>
        <difficulty-button :difficulty="quest.difficulty.name" />
      </div>
    </ul>
  </aside>
</template>
