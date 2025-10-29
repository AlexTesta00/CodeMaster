<script setup lang="ts">
import { ref } from 'vue'
import router from '../router'
import { loginUser, registerNewUser } from '../utils/api.ts'
import {
    errorToast,
    successToast,
    sweetModalWithImage,
} from '../utils/notify.ts'
import { authenticationTraductor } from '../utils/error-message-traductor.ts'
import LoadingPage from './LoadingPage.vue'
import { useAuthStore } from '../utils/store.ts'

const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const page = ref<'login' | 'register'>('login')
const isLoading = ref(false)
const authStore = useAuthStore()

const goToCorrectPage = (role: string) => {
    if (role === 'admin') {
        router.push('/admin')
        return
    } else {
        router.push('/dashboard')
        return
    }
}

const handleSubmit = async () => {
    try {
        if (page.value === 'login') {
            isLoading.value = true
            const response = await loginUser(nickname.value, password.value)
            if (response.success) {
                await successToast('Login Successful')
                isLoading.value = false
                authStore.setNickname(nickname.value)
                authStore.setRole(response.user!.info.role.name)
                authStore.setBanned(response.user!.banned)
                goToCorrectPage(response.user!.info.role.name)
            } else {
                await errorToast(authenticationTraductor(response.message))
                isLoading.value = false
            }
        } else {
            if (password.value !== confirmPassword.value) {
                await errorToast('Error: Passwords do not match')
                isLoading.value = false
                return
            }

            isLoading.value = true
            const response = await registerNewUser(
                nickname.value,
                email.value,
                password.value,
            )
            if (response.success) {
                await successToast('Registration Successful')
                authStore.setNickname(nickname.value)
                await sweetModalWithImage(
                    `Congratulations you have obtained: Welcome trophy`,
                    'Welcome to the platform!',
                    'https://cdn-icons-png.flaticon.com/512/14697/14697227.png',
                    'Image of trophy obtained',
                )
                isLoading.value = false
                authStore.setRole(response.user!.info.role.name)
                goToCorrectPage(response.user!.info.role.name)
            } else {
                await errorToast(authenticationTraductor(response.message))
                isLoading.value = false
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            await errorToast(authenticationTraductor(error.message))
            isLoading.value = false
        } else {
            isLoading.value = false
        }
    }
}
</script>

<template>
    <div
        v-if="isLoading == false"
        class="bg-white dark:bg-gray-900 animate-fade-in transition duration-500 ease-in-out"
    >
        <div class="flex justify-center h-screen">
            <div
                class="hidden bg-cover lg:block lg:w-2/3"
                style="background-image: url('/images/background-image.png')"
            >
                <div
                    class="flex items-center h-full px-20 bg-gray-900 bg-opacity-40"
                >
                    <div>
                        <h2 class="text-2xl font-bold text-white sm:text-3xl">
                            CodeMaster
                        </h2>

                        <p class="max-w-xl mt-3 text-gray-300">
                            Improve your coding skills with our platform. Join a
                            community of developers and learn from each other.
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6"
            >
                <div class="flex-1">
                    <div class="text-center">
                        <div class="flex justify-center mx-auto">
                            <img
                                class="w-auto h-16 sm:h-16"
                                src="/icons/logo.png"
                                alt="CodeMaster Logo"
                            />
                        </div>

                        <p
                            v-if="page == 'login'"
                            class="mt-3 text-black dark:text-gray-300"
                        >
                            Sign in to access your account
                        </p>
                        <p
                            v-if="page == 'register'"
                            class="mt-3 text-black dark:text-gray-300"
                        >
                            Create account
                        </p>
                    </div>

                    <div class="mt-8">
                        <form method="post" @submit.prevent="handleSubmit">
                            <div>
                                <label
                                    v-if="page == 'login'"
                                    for="nickname"
                                    class="block mb-2 text-sm text-black dark:text-gray-200"
                                    >Nickname</label
                                >
                                <input
                                    v-if="page == 'login'"
                                    id="nickname"
                                    v-model="nickname"
                                    type="text"
                                    name="nickname"
                                    placeholder="example: mariorossi"
                                    class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                />
                                <label
                                    v-if="page == 'register'"
                                    for="nickname"
                                    class="block mb-2 text-sm text-black dark:text-gray-200"
                                    >Nickname</label
                                >
                                <input
                                    v-if="page == 'register'"
                                    id="nickname"
                                    v-model="nickname"
                                    type="text"
                                    name="nickname"
                                    placeholder="example"
                                    class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                    pattern="^[a-zA-Z0-9_]{3,10}$"
                                    title="Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters"
                                />
                            </div>

                            <div class="mt-6">
                                <label
                                    v-if="page == 'register'"
                                    for="email"
                                    class="block mb-2 text-sm text-black dark:text-gray-200"
                                    >Email Address</label
                                >
                                <input
                                    v-if="page == 'register'"
                                    id="email"
                                    v-model="email"
                                    type="email"
                                    name="email"
                                    placeholder="example@example.com or nickname"
                                    class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                    pattern="^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$"
                                    title="example@example.com"
                                />
                            </div>

                            <div class="mt-6">
                                <div class="flex justify-between mb-2">
                                    <label
                                        for="password"
                                        class="text-sm text-black dark:text-gray-200"
                                        >Password</label
                                    >
                                </div>

                                <input
                                    id="password"
                                    v-model="password"
                                    type="password"
                                    name="password"
                                    placeholder="Your Password"
                                    class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40'"
                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                    title="Invalid password format, at least 8 characters, one uppercase letter, one number and one special character"
                                />
                            </div>

                            <div class="mt-6">
                                <div class="flex justify-between mb-2">
                                    <label
                                        v-if="page == 'register'"
                                        for="confirm"
                                        class="text-sm text-black dark:text-gray-200"
                                        >Confirm Password</label
                                    >
                                    <!--<a href="#" class="text-sm text-gray-400 focus:text-blue-500 hover:text-blue-500 hover:underline">Forgot password?</a>-->
                                </div>

                                <input
                                    v-if="page == 'register'"
                                    id="confirm"
                                    v-model="confirmPassword"
                                    type="password"
                                    name="confirm"
                                    placeholder="Your Password"
                                    class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40'"
                                />
                            </div>

                            <div class="mt-6">
                                <button
                                    v-if="page == 'login'"
                                    class="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:bg-secondary focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:text-black"
                                >
                                    Sign in
                                </button>
                                <button
                                    v-if="page == 'register'"
                                    class="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:bg-secondary focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:text-black"
                                >
                                    Sign up
                                </button>
                            </div>
                        </form>

                        <p
                            v-if="page == 'login'"
                            class="mt-6 text-sm text-center text-black dark:text-white"
                        >
                            Don&#x27;t have an account yet?
                            <a
                                v-if="page == 'login'"
                                href="#"
                                class="text-primary focus:outline-none focus:underline hover:underline underline"
                                @click="page = 'register'"
                                >Sign up</a
                            >.
                        </p>
                        <p
                            v-if="page == 'register'"
                            class="mt-6 text-sm text-center text-black dark:text-white"
                        >
                            You have an account?
                            <a
                                v-if="page == 'register'"
                                href="#"
                                class="text-primary focus:outline-none focus:underline hover:underline underline"
                                @click="page = 'login'"
                                >LogIn</a
                            >.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <loading-page v-if="isLoading" />
</template>
