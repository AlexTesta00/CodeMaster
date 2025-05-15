<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'
import TestEditor from '../components/TestEditor.vue'
import YesOrNoDialog from '../components/YesOrNoDialog.vue'

const isBackDialogOpen = ref(false)
const isQuestDialogOpen = ref(false)

const allowedLanguages = ref(['Java', 'Scala', 'Kotlin'])
const leftPanelWidth = ref(
    parseInt(localStorage.getItem('leftPanelWidth') || '500'),
)
let isDragging = false

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

const handleConfirm = () => {
    //TODO: Return back
    isBackDialogOpen.value = false
}

const handleClose = () => {
    isBackDialogOpen.value = false
}

const handleQuestConfirm = () => {
    //TODO: Forward code quest
    isQuestDialogOpen.value = false
}

const handleQuestClose = () => {
    isQuestDialogOpen.value = false
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
        class="h-[90dvh] flex flex-row bg-background dark:bg-bgdark mx-4 my-4 overflow-hidden animate-fade-in"
    >
        <!-- Dialog for return back -->
        <yes-or-no-dialog
            title="Are you sure?"
            message="Changes will not be saved and the codequest will not be forwarded"
            :is-open-dialog="isBackDialogOpen"
            @confirm="handleConfirm"
            @close="handleClose"
        />

        <!-- Dialog for send codequest -->
        <yes-or-no-dialog
            title="Are you sure?"
            message="The codequest will be forwarded"
            :is-open-dialog="isQuestDialogOpen"
            @confirm="handleQuestConfirm"
            @close="handleQuestClose"
        />

        <!-- Form Section -->
        <form
            :style="{ width: leftPanelWidth + 'px' }"
            class="flex flex-col h-full overflow-auto min-w-[200px] max-w-[calc(100%-200px)] gap-4"
            data-aos="fade-up"
            data-aos-duration="1600"
        >
            <label for="title" class="text-black dark:text-white text-2xl"
                >Title*
                <span class="text-base text-gray-500"
                    >(Max 50 char)</span
                ></label
            >
            <input
                id="title"
                type="text"
                name="title"
                class="border-2 border-primary w-2/5 rounded-l"
                maxlength="50"
                placeholder="Example: Reverse string"
                required
            />
            <label for="description" class="text-black dark:text-white text-2xl"
                >Description*
                <span class="text-base text-gray-500"
                    >(Max 255 char)</span
                ></label
            >
            <textarea
                id="description"
                name="description"
                maxlength="255"
                placeholder="Example: I want to get the reverse of a string"
                required
            />
            <label for="example" class="text-black dark:text-white text-2xl"
                >Example*
                <span class="text-base text-gray-500"
                    >(Max 255 char)</span
                ></label
            >
            <textarea
                id="description"
                name="description"
                maxlength="255"
                placeholder="Example: input -> abcd, output: -> dcba"
                required
            />
            <label for="languages" class="text-black dark:text-white text-2xl"
                >Allowed Languages*</label
            >
            <div class="w-full flex flex-row items-center justify-start gap-4">
                <div
                    v-for="language in allowedLanguages"
                    :key="language"
                    class="flex flex-row gap-2 ps-4 bg-headline text-white rounded-xl p-4 flex-wrap"
                >
                    <input
                        :id="language"
                        type="checkbox"
                        :name="language"
                        class="accent-primary"
                        checked
                    />
                    <label :for="language">{{ language }}</label>
                </div>
            </div>
        </form>

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
            <test-editor />
        </div>
    </section>

    <!-- Bottom NavBar -->
    <footer
        class="flex flex-row justify-center items-center w-full h-16 fixed bottom-0 mb-7"
    >
        <button-with-image
            title="Return back"
            image-url="/icons/back.svg"
            alt-text="Return back"
            @click="isBackDialogOpen = true"
        />
        <button-with-image
            title="Submit"
            image-url="/icons/upload.svg"
            alt-text="Submit codequest"
            @click="isQuestDialogOpen = true"
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
