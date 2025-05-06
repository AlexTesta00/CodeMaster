<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref('register')

const toggleLogin = (): void => {
    currentPage.value = currentPage.value === 'register' ? 'login' : 'register'
}
</script>

<template>
    <section
        class="h-screen bg-liquid-pattern bg-no-repeat bg-center bg-cover flex flex-col justify-center items-center"
        :class="currentPage === 'login' ? 'lg:items-end' : 'lg:items-start'"
    >
        <!--DashboardCard Section-->
        <Transition name="form-slide" mode="out-in" appear>
            <div
                :key="currentPage"
                class="h-full bg-white w-4/5 lg:w-2/5 my-6 rounded-3xl flex flex-col justify-start items-center lg:ml-24 transform transition-all duration-700 ease-in-out"
                :class="currentPage === 'login' ? 'lg:mr-24' : 'lg:ml-24'"
            >
                <!--Logo Section-->
                <div
                    class="flex flex-row justify-center items-center gap-2 mt-8"
                >
                    <img
                        src="/images/logo.png"
                        alt="CodeMaster Logo"
                        class="w-10 h-10 lg:w-16 lg:h-16"
                    />
                    <h1
                        class="text-black dark:text-white text-base lg:text-2xl select-none"
                    >
                        CodeMaster
                    </h1>
                </div>
                <!--Title Section-->
                <h1
                    v-if="currentPage == 'register'"
                    class="text-4xl text-black dark:text-white mt-4 text-center lg:text-5xl font-sans"
                >
                    Create <br />Account
                </h1>
                <h1
                    v-if="currentPage == 'login'"
                    class="text-4xl text-black dark:text-white mt-4 text-center lg:text-5xl font-sans"
                >
                    Welcome <br />Back
                </h1>
                <!--Field Section-->
                <form
                    :key="currentPage"
                    class="w-full mt-8 flex flex-col justify-center items-center gap-4"
                >
                    <label v-if="currentPage == 'register'" for="nickname" />
                    <input
                        v-if="currentPage == 'register'"
                        id="nickname"
                        type="text"
                        name="nickname"
                        placeholder="Nickname"
                        required
                    />
                    <label v-if="currentPage == 'register'" for="email" />
                    <input
                        v-if="currentPage == 'register'"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                    />
                    <label
                        v-if="currentPage == 'login'"
                        for="emailornickname"
                    />
                    <input
                        v-if="currentPage == 'login'"
                        id="emailornickname"
                        type="text"
                        name="emailornickname"
                        placeholder="Email or nickname"
                        required
                    />
                    <label for="password" />
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                    />
                    <label
                        v-if="currentPage == 'register'"
                        for="confirm-password"
                    />
                    <input
                        v-if="currentPage == 'register'"
                        id="confirm-password"
                        type="password"
                        name="confirm-password"
                        placeholder="Confirm Password"
                        required
                    />
                    <!--Create Account Section-->
                    <input
                        v-if="currentPage == 'register'"
                        type="submit"
                        value="Create Account"
                        class="text-white w-4/5 bg-primary mt-8 p-2 rounded-xl lg:rounded-lg lg:h-16 lg:w-2/4"
                    />
                    <input
                        v-if="currentPage == 'login'"
                        type="submit"
                        value="Log In"
                        class="text-white w-4/5 bg-primary mt-8 p-2 rounded-xl lg:rounded-lg lg:h-16 lg:w-2/4"
                    />
                </form>
                <p class="mt-8 text-gray-500">------ Or ------</p>
                <button
                    v-if="currentPage == 'register'"
                    class="mt-6 mb-6 p-2 rounded-xl text-primary text-center border-2 border-primary w-4/5 lg:rounded-lg lg:h-16 lg:w-2/4 md:hover:bg-primary md:hover:text-white duration-300"
                    @click="toggleLogin"
                >
                    Log-In
                </button>
                <button
                    v-if="currentPage == 'login'"
                    class="mt-6 mb-6 p-2 rounded-xl text-primary text-center border-2 border-primary w-4/5 lg:rounded-lg lg:h-16 lg:w-2/4 md:hover:bg-primary md:hover:text-white duration-300"
                    @click="toggleLogin"
                >
                    Register Now
                </button>
                <!--LogIn Section-->
            </div>
        </Transition>
    </section>
</template>

<style scoped>
input[type='text'],
input[type='email'],
input[type='password'] {
    @apply w-4/5
    border-2
    border-gray-500
    rounded-xl
    p-2
    dark:bg-white
    lg:h-16
    lg:w-2/4
    focus:border-primary
    focus:outline-none;
}

.form-slide-enter-active,
.form-slide-leave-active {
    @apply transition-all duration-1000 ease-in-out;
}

.form-slide-enter-from {
    @apply opacity-0 translate-x-10;
}

.form-slide-enter-to {
    @apply opacity-100 translate-x-0;
}

.form-slide-leave-from {
    @apply opacity-100 translate-x-0;
}

.form-slide-leave-to {
    @apply opacity-0 -translate-x-10;
}
</style>
