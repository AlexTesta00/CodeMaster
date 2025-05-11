<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'

const isDarkModeOn = ref(false)

const toggleDarkMode = () => {
    isDarkModeOn.value = !isDarkModeOn.value
    if (isDarkModeOn.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('dark-mode', 'true')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('dark-mode', 'false')
    }
}

onMounted(() => {
    const darkMode = localStorage.getItem('dark-mode')
    if (darkMode === 'true') {
        isDarkModeOn.value = true
        document.documentElement.classList.add('dark')
    } else {
        isDarkModeOn.value = false
        document.documentElement.classList.remove('dark')
    }
})
</script>

<template>
    <section
        class="flex flex-col items-center lg:items-start justify-center lg:justify-start mx-4 bg-background dark:bg-bgdark lg:mx-24 h-screen animate-fade-in"
        data-aos="zoom-in"
        data-aos-duration="1400"
    >
        <h1
            class="text-black text-xl lg:text-3xl font-bold mt-4 dark:text-white"
        >
            Settings
        </h1>
        <div
            class="flex flex-row justify-center items-center lg:justify-start lg:items-start mt-12 w-full gap-9"
        >
            <h2 class="text-black dark:text-white text-lg lg:text-2xl">
                🌞 Light
            </h2>
            <label class="inline-flex items-center cursor-pointer">
                <input
                    v-if="isDarkModeOn == false"
                    type="checkbox"
                    value=""
                    class="sr-only peer"
                    @change="toggleDarkMode"
                />
                <input
                    v-if="isDarkModeOn"
                    type="checkbox"
                    value=""
                    class="sr-only peer"
                    checked
                    @change="toggleDarkMode"
                />
                <div
                    class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-primary"
                />
            </label>
            <h2 class="text-black dark:text-white text-lg lg:text-2xl">
                🌙 Dark
            </h2>
        </div>
    </section>
    <footer
        class="left-0 bottom-0 w-full fixed flex flex-row justify-center items-center mb-24 animate-fade-in"
        data-aos="zoom-in"
        data-aos-duration="1400"
    >
        <button-with-image
            title="Return Back"
            image-url="/icons/back.svg"
            alt-text="Back button"
            class="hover:bg-headline ml-0"
        />
    </footer>
</template>
