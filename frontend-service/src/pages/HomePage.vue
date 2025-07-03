<script setup lang="ts">
import { ref } from 'vue'
import DarkOrLight from '../components/DarkOrLight.vue'

const isOpen = ref(false)
</script>

<template>
  <header class="bg-background dark:bg-gray-900">
    <nav
      class="relative lg:fixed bg-background dark:bg-gray-900 lg:w-full z-50"
      data-aos="fade-left"
      data-aos-duration="1600"
    >
      <div
        class="container px-6 py-4 mx-auto md:flex md:justify-between md:items-center"
      >
        <div class="flex items-center justify-between">
          <a href="#home">
            <img
              class="w-16 h-16 sm:h-7 object-cover"
              src="/icons/logo.png"
              alt="Codemaster logo"
            >
          </a>

          <div class="flex md:hidden">
            <button
              type="button"
              class="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
              aria-label="toggle menu"
              @click="isOpen = !isOpen"
            >
              <svg
                v-show="!isOpen"
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 8h16M4 16h16"
                />
              </svg>

              <svg
                v-show="isOpen"
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          :class="[
            isOpen
              ? 'translate-x-0 opacity-100 '
              : 'opacity-0 -translate-x-full',
          ]"
          class="absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent md:dark:bg-transparent md:mt-0 md:p-0 md:top-0 md:relative md:w-auto md:opacity-100 md:translate-x-0 md:flex md:items-center"
        >
          <div class="flex flex-col md:flex-row md:mx-6">
            <a
              class="my-2 text-gray-700 transition-colors duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 md:mx-4 md:my-0"
              href="#home"
            >Home</a>
            <a
              class="my-2 text-gray-700 transition-colors duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 md:mx-4 md:my-0"
              href="#strengths"
            >Strengths</a>
            <a
              class="my-2 text-gray-700 transition-colors duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 md:mx-4 md:my-0"
              href="#team"
            >Team</a>
            <a
              class="my-2 text-gray-700 transition-colors duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 md:mx-4 md:my-0"
              href="#faq"
            >F.A.Q</a>
            <router-link
              class="my-2 text-gray-700 transition-colors duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 md:mx-4 md:my-0"
              to="/login"
            >
              Login
            </router-link>
            <dark-or-light />
          </div>
        </div>
      </div>
    </nav>

    <div
      id="home"
      class="container px-6 py-16 mx-auto"
      data-aos="fade-right"
      data-aos-duration="1600"
    >
      <div class="items-center lg:flex">
        <div class="w-full lg:w-1/2">
          <div class="lg:max-w-lg">
            <h1
              class="text-3xl font-semibold text-gray-800 dark:text-white lg:text-4xl"
            >
              Best place to improve<br>
              your
              <span class="text-primary dark:text-white">codeskills</span>
            </h1>

            <p class="mt-3 text-gray-600 dark:text-gray-400 mb-6">
              Solve. Learn. Collaborate. Become a CodeMaster.
            </p>

            <router-link
              class="w-full px-5 py-2 mt-6 text-sm tracking-wider text-white uppercase transition-colors duration-300 transform bg-primary rounded-lg lg:w-auto hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
              to="/login"
            >
              Register now
            </router-link>
          </div>
        </div>

        <div
          class="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2"
        >
          <img
            class="w-full h-full lg:max-w-3xl"
            src="/images/home_img.png"
            alt="Catalogue-pana.svg"
          >
        </div>
      </div>
    </div>
  </header>

  <section
    id="strengths"
    class="bg-background dark:bg-gray-900"
  >
    <div class="container px-6 py-10 mx-auto">
      <h1
        class="text-2xl font-semibold text-center capitalize lg:text-3xl text-primary dark:text-white"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        Strengths
      </h1>

      <div
        class="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-16 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          class="flex flex-col items-center p-6 space-y-3 text-center bg-gray-100 rounded-xl dark:bg-gray-800"
          data-aos="fade-up"
          data-aos-duration="1500"
        >
          <span
            class="inline-block p-3 text-blue-500 bg-blue-100 rounded-full dark:text-white dark:bg-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </span>

          <h1
            class="text-xl font-semibold text-gray-700 capitalize dark:text-white"
          >
            Zero setup
          </h1>

          <p class="text-gray-500 dark:text-gray-300">
            Start programming right away. No tedious configuration,
            just an environment ready for action.
          </p>
        </div>

        <div
          class="flex flex-col items-center p-6 space-y-3 text-center bg-gray-100 rounded-xl dark:bg-gray-800"
          data-aos="fade-up"
          data-aos-duration="1600"
        >
          <span
            class="inline-block p-3 text-blue-500 bg-blue-100 rounded-full dark:text-white dark:bg-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </span>

          <h1
            class="text-xl font-semibold text-gray-700 capitalize dark:text-white"
          >
            Clean UI
          </h1>

          <p class="text-gray-500 dark:text-gray-300">
            Modern, intuitive interface designed for programmers:
            everything you need, nothing to distract you.
          </p>
        </div>

        <div
          class="flex flex-col items-center p-6 space-y-3 text-center bg-gray-100 rounded-xl dark:bg-gray-800"
          data-aos="fade-up"
          data-aos-duration="1700"
        >
          <span
            class="inline-block p-3 text-blue-500 bg-blue-100 rounded-full dark:text-white dark:bg-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </span>

          <h1
            class="text-xl font-semibold text-gray-700 capitalize dark:text-white"
          >
            Improve your skills
          </h1>

          <p class="text-gray-500 dark:text-gray-300">
            Test and improve your programming skills with hundreds
            of daily codequests
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gray-100 dark:bg-gray-900">
    <div class="container px-6 py-10 mx-auto">
      <div
        class="mt-8 lg:-mx-6 lg:flex lg:items-center"
        data-aos="fade-right"
        data-aos-duration="1200"
      >
        <img
          class="object-cover w-full lg:mx-6 lg:w-1/2 rounded-xl h-72 lg:h-96"
          src="/images/software-developer.jpeg"
          alt="In this image there is a software developer with multiple screens and a laptop. He is working on a codequest challenge."
        >

        <div class="mt-6 lg:w-1/2 lg:mt-0 lg:mx-6">
          <h2
            class="block mt-4 text-2xl font-semibold text-gray-800 dark:text-white"
          >
            All the power of code in the palm of your hands
          </h2>

          <p
            class="mt-3 text-sm text-gray-500 dark:text-gray-300 md:text-sm"
          >
            No downloads, no configuration: the editor is already up
            and running. Log in, choose your challenge, and start
            programming instantly. Coding without waiting, just pure
            fun and concrete practice.
          </p>
        </div>
      </div>

      <div
        class="mt-8 lg:-mx-6 lg:flex lg:items-center"
        data-aos="fade-left"
        data-aos-duration="1400"
      >
        <img
          class="object-cover object-top w-full lg:mx-6 lg:w-1/2 rounded-xl h-72 lg:h-96"
          src="/images/girl-developer.jpeg"
          alt="In this image there is a girl developer with their laptop. She is working on a codequest challenge."
        >
        <div class="mt-6 lg:w-1/2 lg:mt-0 lg:mx-6">
          <h2
            class="block mt-4 text-2xl font-semibold text-gray-800 dark:text-white"
          >
            Get swept up in CodeQuest
          </h2>

          <p
            class="mt-3 text-sm text-gray-500 dark:text-gray-300 md:text-sm"
          >
            Every day new challenges, new quests, new levels to
            overcome. CodeQuests are designed to challenge you in a
            compelling and continuous way. Get ready to become
            addicted -- to code!
          </p>
        </div>
      </div>

      <div
        class="mt-8 lg:-mx-6 lg:flex lg:items-center"
        data-aos="fade-right"
        data-aos-duration="1600"
      >
        <img
          class="object-cover w-full lg:mx-6 lg:w-1/2 rounded-xl h-72 lg:h-96"
          src="/images/person-with-laptop.jpeg"
          alt="Person with laptop and red cup"
        >

        <div class="mt-6 lg:w-1/2 lg:mt-0 lg:mx-6">
          <h2
            class="block mt-4 text-2xl font-semibold text-gray-800 dark:text-white"
          >
            Smart selectivity for your business
          </h2>

          <p
            class="mt-3 text-sm text-gray-500 dark:text-gray-300 md:text-sm"
          >
            Smart selectivity for your company Build up your team
            with targeted challenges: test skills, identify hidden
            talent, and stimulate continuous learning. With
            CodeMaster, selection becomes valuable training.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section
    id="team"
    class="bg-white dark:bg-gray-900"
  >
    <div class="container px-6 py-10 mx-auto">
      <h1
        class="text-2xl font-semibold text-center text-primary capitalize lg:text-3xl dark:text-white"
        data-aos="zoom-in"
        data-aos-duration="1000"
      >
        Team
      </h1>

      <p
        class="max-w-2xl mx-auto my-6 text-center text-gray-500 dark:text-gray-300"
        data-aos="zoom-in"
        data-aos-duration="1400"
      >
        We are the team that turns challenges into solutions and bugs
        into learning opportunities.
      </p>

      <div
        class="grid grid-cols-1 gap-8 mt-8 xl:mt-16 md:grid-cols-2 xl:grid-cols-2"
      >
        <div
          class="flex flex-col items-center p-8 transition-colors duration-300 transform border rounded-xl hover:border-transparent dark:border-gray-700"
          data-aos="zoom-in"
          data-aos-duration="1400"
        >
          <img
            class="object-cover w-32 h-32 rounded-full ring-4 ring-gray-300"
            src="/images/alex-ceo.jpg"
            alt="Photo of Alex Testa"
          >

          <h1
            class="mt-4 text-2xl font-semibold text-gray-700 capitalize dark:text-white"
          >
            Alex Testa
          </h1>

          <p class="mt-2 text-gray-500 capitalize dark:text-gray-300">
            CEO & Full stack developer
          </p>
        </div>

        <div
          class="flex flex-col items-center p-8 transition-colors duration-300 transform border rounded-xl hover:border-transparent dark:border-gray-700"
          data-aos="zoom-in"
          data-aos-duration="1400"
        >
          <img
            class="object-cover w-32 h-32 rounded-full ring-4 ring-gray-300"
            src="/images/riccardo-ceo.jpg"
            alt="Photo of Riccardo Rambaldi"
          >
          <a
            href="https://www.youtube.com/watch?v=xvFZjo5PgG0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h1
              class="mt-4 text-2xl font-semibold text-gray-700 capitalize dark:text-white"
            >
              Riccardo Rambaldi
            </h1>
          </a>

          <p class="mt-2 text-gray-500 capitalize dark:text-gray-300">
            CEO & Full stack developer
          </p>
        </div>
      </div>
    </div>
  </section>

  <section
    id="review"
    class="bg-white dark:bg-gray-900"
  >
    <div class="container px-6 py-10 mx-auto">
      <h1
        class="text-2xl font-semibold text-center text-primary capitalize lg:text-3xl dark:text-white"
        data-aos="zoom-out"
        data-aos-duration="1200"
      >
        We don't just say that...
      </h1>

      <p
        class="max-w-2xl mx-auto mt-6 text-center text-gray-500 dark:text-gray-300"
        data-aos="zoom-out"
        data-aos-duration="1200"
      >
        Those who know us say this about us
      </p>

      <section
        class="grid grid-cols-1 gap-8 mt-8 xl:mt-12 lg:grid-cols-2 xl:grid-cols-3"
      >
        <div
          class="p-8 border rounded-lg dark:border-gray-700"
          data-aos="zoom-out"
          data-aos-duration="1200"
        >
          <p class="leading-loose text-gray-500 dark:text-gray-400">
            We don't just say that...I was looking for a way to
            really get better at programming, going beyond YouTube
            tutorials. With CodeMaster, I found a clear, practical
            path full of exciting challenges. I finally feel I am
            really growing, day by day!
          </p>

          <div class="flex items-center mt-8 -mx-2">
            <img
              class="object-cover mx-2 rounded-full w-14 shrink-0 h-14 ring-4 ring-gray-300 dark:ring-gray-700"
              src="/images/minecraft-creeper.png"
              alt="Miencraft Creeper Easter Egg"
            >

            <div class="mx-2">
              <a
                href="https://www.youtube.com/watch?v=QbM2qlIprTI"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h1
                  class="font-semibold text-gray-800 dark:text-white"
                >
                  Marco B.
                </h1>
              </a>
              <span class="text-sm text-gray-500">Students</span>
            </div>
          </div>
        </div>

        <div
          class="p-8 border rounded-lg dark:border-gray-700"
          data-aos="zoom-out"
          data-aos-duration="1400"
        >
          <p class="leading-loose text-gray-500 dark:text-gray-400">
            Working in business, time to get up to speed is short,
            but with CodeMaster I am able to fill my technical gaps
            in a focused way. The tutorials are concrete and
            immediately applicable in daily work. A valuable ally
            for any developer.
          </p>

          <div class="flex items-center mt-8 -mx-2">
            <img
              class="object-cover mx-2 rounded-full w-14 shrink-0 h-14 ring-4 ring-gray-300 dark:ring-gray-700"
              src="/images/2-testimonial.jpg"
              alt=""
            >

            <div class="mx-2">
              <h1
                class="font-semibold text-gray-800 dark:text-white"
              >
                Chiara R.
              </h1>
              <span class="text-sm text-gray-500">Software Engineer</span>
            </div>
          </div>
        </div>

        <div
          class="p-8 border rounded-lg dark:border-gray-700"
          data-aos="zoom-out"
          data-aos-duration="1600"
        >
          <p class="leading-loose text-gray-500 dark:text-gray-400">
            We use CodeMaster not only to assess candidates' skills,
            but also to train them. It has become a strategic tool
            in our selection process: practical, reliable and truly
            results-oriented. It's very funny to use, and have a
            great UI and UX
          </p>

          <div class="flex items-center mt-8 -mx-2">
            <img
              class="object-cover mx-2 rounded-full w-14 shrink-0 h-14 ring-4 ring-gray-300 dark:ring-gray-700"
              src="/images/3-testimonial.jpg"
              alt=""
            >

            <div class="mx-2">
              <h1
                class="font-semibold text-gray-800 dark:text-white"
              >
                Ema Watson
              </h1>
              <span class="text-sm text-gray-500">CEO of Netflix</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>

  <section
    id="faq"
    class="bg-white dark:bg-gray-900"
  >
    <div class="container px-6 py-12 mx-auto">
      <h1
        class="text-2xl font-semibold text-primary lg:text-3xl text-center dark:text-white"
        data-aos="fade-in"
        data-aos-duration="1000"
      >
        Frequently asked questions
      </h1>

      <div
        class="mt-8 space-y-8 lg:mt-12"
        data-aos="fade-right"
        data-aos-duration="1200"
      >
        <div class="p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h1 class="font-semibold text-gray-700 dark:text-white">
            How do I create an account?
          </h1>
          <p class="mt-6 text-sm text-gray-500 dark:text-gray-300">
            To create an account, click on the “Sign Up” button at
            the top right of the homepage and fill in the required
            information. You’ll be ready to go in just a few
            minutes!
          </p>
        </div>
      </div>

      <div
        class="mt-8 space-y-8 lg:mt-12"
        data-aos="fade-left"
        data-aos-duration="1400"
      >
        <div class="p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h1 class="font-semibold text-gray-700 dark:text-white">
            What programming languages does the platform support?
          </h1>
          <p class="mt-6 text-sm text-gray-500 dark:text-gray-300">
            Our platform currently supports a wide range of
            languages, including Java, Kotlin, Scala.
          </p>
        </div>
      </div>

      <div
        class="mt-8 space-y-8 lg:mt-12"
        data-aos="fade-right"
        data-aos-duration="1600"
      >
        <div class="p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h1 class="font-semibold text-gray-700 dark:text-white">
            Does the platform support collaborative coding?
          </h1>
          <p class="mt-6 text-sm text-gray-500 dark:text-gray-300">
            No, the platform does not support collaborative coding
            at the moment. However, we are working on this feature
            and it will be available in the future.
          </p>
        </div>
      </div>

      <div
        class="mt-8 space-y-8 lg:mt-12"
        data-aos="fade-left"
        data-aos-duration="1800"
      >
        <div class="p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h1 class="font-semibold text-gray-700 dark:text-white">
            Can I use external libraries and packages?
          </h1>
          <p class="mt-6 text-sm text-gray-500 dark:text-gray-300">
            No, the platform does not support the use of external
            libraries and packages at the moment. However, we are
            working on this feature and it will be available in the
            future.
          </p>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-bgdark">
    <div
      class="container flex flex-col items-center justify-between p-6 mx-auto space-y-4 sm:space-y-0 sm:flex-row"
    >
      <a href="#">
        <img
          class="w-16 h-16"
          src="/icons/logo.png"
          alt="Code Master Logo"
        >
      </a>

      <p class="text-sm text-white dark:text-gray-300">
        © Copyright 2025. All Rights Reserved.
      </p>

      <div class="flex -mx-2">
        <a
          href="https://github.com/AlexTesta00/CodeMaster"
          class="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          aria-label="Github"
        >
          <img
            src="/icons/github.svg"
            alt="Github codemaster page"
            class="w-8 h-8"
          >
        </a>
      </div>
    </div>
  </footer>
</template>
