<script setup lang="ts">
import DifficultyButton from './DifficultyButton.vue'

const props = defineProps<{
    index: number
    title: string
    difficulty: string
    isSolved: boolean
    questId: string
    deletable: boolean
}>()

const emit = defineEmits<{
    (e: 'expand'): void
    (e: 'delete', questId: string): void
}>()

const handleClick = () => emit('expand')

const handleDelete = (event: MouseEvent) => {
    event.stopPropagation()
    emit('delete', props.questId)
}
</script>

<template>
    <div
        class="group flex flex-row justify-between items-start p-8 bg-white dark:bg-headline dark:hover:bg-secondary dark:hover:text-black dark:text-white m-4 rounded-xl hover:bg-primary hover:text-white duration-1000"
        @click="handleClick"
        data-aos="zoom-in"
        data-aos-duration="600"
        data-aos-anchor="#questcontainer"
        data-aos-delay="200"
    >
        <p>{{ index }}.{{ title }}</p>
        <div class="flex flex-row gap-6 items-center">
            <img
                v-if="isSolved"
                src="/icons/checked.svg"
                alt="CodeQuest Solved Mark"
                class="w-6 h-6 lg:w-8 lg:h-8"
            />
            <difficulty-button :difficulty="difficulty.toLowerCase()" />
            <button
                v-if="deletable"
                @click="handleDelete"
                class="font-semibold px-3 py-1"
                aria-label="Delete codequest"
                type="button"
            >
                <span
                    class="w-6 h-6 block bg-black group-hover:bg-white dark:bg-white dark:group-hover:bg-black mask mask-center mask-no-repeat mask-contain"
                    style="
                        mask-image: url('/icons/trashcan.svg');
                        -webkit-mask-image: url('/icons/trashcan.svg');
                    "
                ></span>
            </button>
        </div>
    </div>
</template>
