<script setup lang="ts">
import CodeQuest from '../components/CodeQuest.vue'
import { ref } from 'vue'
import LanguageButton from '../components/LanguageButton.vue'
import TextareaLanguage from '../components/TextareaLanguage.vue'
import ButtonWithImage from '../components/ButtonWithImage.vue'

const bioIsEditing = ref(false)
const languageIsEditing = ref(false)
const cvIsEditing = ref(false)
const selectedLanguages = ref<string[]>([
    'java',
    'kotlin',
    'scala',
    'python',
    'dart',
    'c',
    'c#',
    'c++',
])

const removeLanguage = (lang: string) => {
    selectedLanguages.value = selectedLanguages.value.filter((l) => l !== lang)
}

const addLanguage = (lang: string) => {
    lang = lang.toLowerCase()
    if (!selectedLanguages.value.includes(lang)) {
        selectedLanguages.value.push(lang)
    }
    console.log('Selected languages:', lang)
}
</script>

<template>
    <section
        class="flex flex-col items-center justify-center mx-4 bg-background animate-fade-in"
    >
        <h1
            class="text-black dark:text-white text-3xl lg:text-5xl w-full text-center mt-4"
        >
            Alex's Profile
        </h1>
        <div
            class="flex flex-row justify-start items-start w-full lg:w-2/5 mt-8 bg-headline rounded-3xl"
            data-aos="zoom-in"
            data-aos-duration="1400"
        >
            <img
                src="/images/barney.png"
                alt="Barney Image Art"
                class="w-32 rounded-xl lg:w-64"
            />
            <div
                class="flex flex-col justify-center items-start w-full h-full p-4"
            >
                <h2 class="text-white ml-2 text-xl lg:text-3xl">
                    Bio
                    <span
                        class="cursor-pointer hidden lg:inline"
                        @click="bioIsEditing = !bioIsEditing"
                        >✎</span
                    >
                </h2>
                <p
                    v-if="!bioIsEditing"
                    class="text-white text-sm ml-2 lg:text-xl w-4/5"
                    data-aos="zoom-in"
                    data-aos-duration="1400"
                >
                    Questa è una piccola bio, giusto per introdurre la persona
                    utilizzatrice di questa piattaforma, al massimo potrà
                    inserire 150 caratteri
                </p>
                <div
                    v-if="bioIsEditing"
                    class="w-full flex flex-row items-center justify-center"
                >
                    <textarea
                        placeholder="Max 150 characters"
                        data-aos="zoom-in"
                        data-aos-duration="1400"
                        class="block mt-2 w-full h-full max-h-44 min-h-11 placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300"
                    />
                </div>
            </div>
        </div>
        <!-- Favorite Language -->
        <div
            class="flex flex-col justify-start items-start w-full lg:w-2/5 mt-8 bg-headline rounded-3xl relative z-10"
            data-aos="zoom-in"
            data-aos-duration="1400"
        >
            <h2
                class="text-white ml-4 mt-2 lg:ml-6 lg:mt-2 text-xl lg:text-3xl"
            >
                Favorites Languages
                <span
                    class="cursor-pointer hidden lg:inline"
                    @click="languageIsEditing = !languageIsEditing"
                    >✎</span
                >
            </h2>
            <div
                class="flex flex-wrap shrink justify-start items-center gap-6 ml-8 mt-6 mb-6"
            >
                <language-button
                    :names="selectedLanguages"
                    :is-editable="languageIsEditing"
                    @remove-language="removeLanguage"
                />
            </div>
            <div
                v-if="languageIsEditing"
                class="w-full flex flex-row items-center justify-center relative lg:mt-6 lg:mb-8"
            >
                <textarea-language @language-selected="addLanguage" />
            </div>
        </div>
        <!-- See my cv -->
        <div
            class="flex flex-col justify-start items-start w-full lg:w-2/5 mt-8 bg-headline rounded-3xl"
            data-aos="zoom-in"
            data-aos-duration="1400"
        >
            <h2
                class="text-white ml-4 mt-2 lg:ml-6 lg:mt-2 text-xl lg:text-3xl"
            >
                My CV
            </h2>
            <div
                class="w-full flex flex-col justify-center items-center"
                data-aos="zoom-in"
                data-aos-duration="1400"
            >
                <button
                    v-if="!cvIsEditing"
                    class="w-3/4 lg:w-2/5 bg-primary text-white text-base lg:text-xl p-4 my-6 rounded-3xl"
                >
                    <span
                        class="cursor-pointer hidden lg:inline"
                        @click="cvIsEditing = !cvIsEditing"
                        >✎</span
                    >
                    See my cv
                </button>
                <div
                    v-if="cvIsEditing"
                    class="flex items-center mt-2"
                    data-aos="zoom-in"
                    data-aos-duration="1400"
                >
                    <p
                        class="py-2.5 px-3 text-white bg-primary dark:bg-gray-800 dark:border-gray-700 rtl:rounded-r-lg rtl:rounded-l-none rtl:border-l-0 rtl:border-r rounded-l-lg mb-4"
                    >
                        https://
                    </p>
                    <input
                        type="text"
                        placeholder="example.com"
                        class="block w-full rounded-l-none rtl:rounded-l-lg rtl:rounded-r-none placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300 mb-4"
                        @keyup.enter="cvIsEditing = false"
                    />
                </div>
            </div>
        </div>
        <!-- CodeQuest Resolved -->
        <div
            class="flex flex-col lg:flex-row justify-center items-center lg:justify-evenly lg:items-stretch gap-10 w-full mt-8"
            data-aos="zoom-in"
            data-aos-duration="1400"
        >
            <div
                id="questcontainer"
                class="w-full lg:w-2/5 h-96 overflow-y-auto overflow-x-hidden bg-gray-400 rounded-3xl mt-4"
                data-aos="zoom-in"
                data-aos-duration="600"
            >
                <code-quest
                    :key="1"
                    :index="1"
                    title="Reverse string"
                    difficulty="easy"
                    :is-solved="true"
                    data-aos-anchor="#questcontainer"
                />
                <code-quest
                    :key="2"
                    :index="2"
                    title="Reverse string"
                    difficulty="Medium"
                    :is-solved="true"
                    data-aos-anchor=".questcontainer"
                />
                <code-quest
                    :key="3"
                    :index="3"
                    title="Reverse string"
                    difficulty="Easy"
                    :is-solved="true"
                    data-aos-anchor="questcontainer"
                />
                <code-quest
                    :key="4"
                    :index="4"
                    title="Reverse string"
                    difficulty="Medium"
                    :is-solved="true"
                    data-aos-anchor="#questcontainer"
                />
                <code-quest
                    :key="5"
                    :index="5"
                    title="Reverse string"
                    difficulty="Hard"
                    :is-solved="true"
                    data-aos-anchor=".questcontainer"
                />
            </div>
        </div>
        <footer
            class="left-0 bottom-0 fixed w-full hidden lg:inline animate-fade-in"
        >
            <div class="flex flex-row justify-between items-start w-full h-14">
                <button-with-image
                    title="Return Back"
                    image-url="/icons/back.svg"
                    alt-text="Back button"
                    class="lg:ml-80"
                />
                <div
                    class="flex flex-row justify-center items-center mr-4 lg:mr-80 gap-6"
                >
                    <button
                        class="flex items-center px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-primary rounded-full hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                    >
                        <img
                            src="/icons/settings.svg"
                            alt="Icon add"
                            class="w-8 h-8"
                        />
                    </button>
                    <button
                        class="flex items-center px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-primary rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                    >
                        <img
                            src="/icons/add.svg"
                            alt="Icon add"
                            class="w-5 h-5"
                        />
                        <span class="mx-1 lg:text-xl">New CodeQuest</span>
                    </button>
                </div>
            </div>
        </footer>
    </section>
</template>
