<script setup lang="ts">
import ProgressBar from '../components/ProgressBar.vue'
import DashboardCard from '../components/DashboardCard.vue'
import ButtonFilter from '../components/ButtonFilter.vue'
import { onMounted, type Ref, ref } from 'vue'
import ContactsCard from '../components/ContactsCard.vue'
import router from '../router'
import { useAuthStore } from '../utils/store.ts'
import LoadingPage from './LoadingPage.vue'
import CodeQuestComp from '../components/CodeQuestComp.vue'
import type {
  Level,
  Person,
  ProfilePicture,
  Trophy,
  CodeQuest
} from '../utils/interface.ts'
import { errorToast } from '../utils/notify.ts'
import {getAllCodequests, getSolutionsByCodequest, getUserByNickname} from '../utils/api.ts'
import { isSome } from 'fp-ts/Option'

interface CodeQuestWithSolved {
  codequest: CodeQuest
  isSolved: boolean
}

const allCodequests = ref<CodeQuestWithSolved[]>([])
const codequests = ref<CodeQuestWithSolved[]>([])
const contacts: Ref<Person[]> = ref([])
const isLoading = ref(false)
const profilePicture = ref<ProfilePicture | null>(null)
const lastTrophy = ref<Trophy | null>(null)
const level = ref<Level | null>(null)
const filterActive = ref('none')
const auth = useAuthStore()

const expandCodequest = (id: string) => {
  router.push({
    name: 'Code',
    params: { id: id }
  })
}

const toggleFilterActive = (filter: string) => {
  filterActive.value = filterActive.value === filter ? 'none' : filter

  if (filterActive.value === 'none') {
    codequests.value = allCodequests.value
  } else {
    codequests.value = allCodequests.value.filter(
        (quest, _) => quest.codequest.difficulty.name.toLowerCase() === filterActive.value
    )
  }
}

onMounted(async () => {
  auth.loadNickname()
  if (auth.nickname) {
    try {
      isLoading.value = true
      const response = await fetch('/data/contacts.json')
      if (!response.ok) {
        await errorToast("Can't load contacts")
      }
      contacts.value = await response.json()

      const res = await getUserByNickname(auth.nickname)
      if (res.success) {
        if (isSome(res.user.profilePicture)) {
          profilePicture.value = res.user.profilePicture.value
        }

        if (isSome(res.user.trophies)) {
          const trophies = Array.from(res.user.trophies.value)
          if (trophies.length > 0) {
            lastTrophy.value = trophies[trophies.length - 1]
          }
        }

        level.value = res.user.level
      } else {
        await errorToast('Failed to load user data')
        await router.push('/error')
      }

      const codequestRes = await getAllCodequests()
      if (codequestRes.success) {
        for (const codeQuest of codequestRes.codequests) {
          const solRes = await getSolutionsByCodequest(codeQuest.id)
          if (solRes.success) {
            const userSolution = solRes.solutions.find(sol => sol.user === auth.nickname)
            const isSolved = userSolution ? userSolution.solved : false
            const newEntry = {
              codequest: codeQuest,
              isSolved
            }
            codequests.value.push(newEntry)
            allCodequests.value.push(newEntry)
          }
        }
      }
      console.log('Filtered Codequests loaded:', codequests.value)
      console.log('All Codequests loaded:', allCodequests.value)
    } catch {
      await errorToast('Failed to fetch data')
      await router.push('/error')
    } finally {
      isLoading.value = false
    }
  } else {
    await errorToast('Dashboard page requires authentication')
    await router.push('/error')
  }
})
</script>

<template>
  <section
      class="lg:ml-16 min-h-screen bg-background dark:bg-bgdark animate-fade-in overflow-y-hidden"
  >
    <!--Title welcome back-->
    <header>
      <h1
          class="text-black text-center lg:text-left text-3xl lg:text-5xl mt-6 dark:text-white lg:ml-4 animate-fade-in"
      >
        Welcome Back 👋🏻,<br>{{ auth.nickname }}
      </h1>
    </header>
    <!--First section-->
    <div
        class="mx-4 md:mx-12 lg:mx-4 mt-4 flex flex-col lg:flex-row lg:items-stretch lg:mt-12 items-center h-full gap-6"
    >
      <!--DashboardCard see profile-->
      <dashboard-card>
        <img
            :src="
            profilePicture
              ? profilePicture.url
              : '/images/barney.png'
          "
            class="w-32 h-32 rounded-lg"
            :alt="profilePicture?.url + ' characters profile image'"
        >
        <router-link
            class="text-white bg-primary p-2 w-2/4 mt-6 rounded-xl hover:bg-secondary hover:text-black duration-200 text-center"
            to="/profile"
        >
          See Profile
        </router-link>
      </dashboard-card>
      <!--DashboardCard Easy, Medium, Hard-->
      <dashboard-card>
        <progress-bar
            difficulty="Easy"
            :current-value="allCodequests
              .filter(
                quest => quest.codequest.difficulty.name == 'easy' &&
                quest.isSolved
              ).length"
            :max-value="200"
        />
        <progress-bar
            difficulty="Medium"
            :current-value="allCodequests
              .filter(
                  quest => quest.codequest.difficulty.name == 'medium' &&
                  quest.isSolved
              ).length"
            :max-value="250"
        />
        <progress-bar
            difficulty="Hard"
            :current-value="allCodequests
              .filter(
                  quest => quest.codequest.difficulty.name == 'hard' &&
                  quest.isSolved
              ).length"
            :max-value="100"
        />
      </dashboard-card>
      <!--DashboardCard Last Trophies-->
      <dashboard-card>
        <h2 class="text-2xl text-white">
          Last Trophies
        </h2>
        <img
            :src="lastTrophy?.url || '/images/dog.png'"
            class="w-32 h-32 object-cover"
            alt="Trophy Photo"
        >
        <h3 class="text-xl text-white">
          {{ lastTrophy?.title.value || 'No trophy yet' }}
        </h3>
      </dashboard-card>
      <!--DashboardCard Level -->
      <dashboard-card>
        <h2 class="text-2xl text-white">
          Level
        </h2>
        <img
            :src=" level?.imageUrl || '/images/dog.png'"
            class="w-32 h-32 object-cover"
            alt="Level Photo"
        >
        <h3 class="text-xl text-white">
          {{ level?.title || 'No level yet' }}
        </h3>
      </dashboard-card>
    </div>
    <!--Title CodeQuestComp-->
    <div
        class="w-full flex flex-row justify-center items-center lg:justify-between"
    >
      <h1
          class="text-black text-center lg:text-left text-3xl lg:text-5xl mt-16 dark:text-white lg:ml-4"
          data-aos="zoom-in"
          data-aos-duration="1400"
      >
        CodeQuest
      </h1>
      <h1
          class="text-black lg:text-left text-3xl lg:text-5xl mt-16 dark:text-white lg:mr-8 collapse lg:visible"
          data-aos="zoom-in"
          data-aos-duration="1400"
      >
        Contacts
      </h1>
    </div>
    <!--Second Section-->
    <div
        class="mx-4 md:mx-12 lg:mx-4 flex flex-col lg:flex-col lg:items-stretch lg:mt-12 items-center h-full gap-6"
        data-aos="zoom-in"
        data-aos-duration="1400"
    >
      <!--Easy, Medium, Hard button-->
      <div
          class="w-full mt-8 lg:mt-0 lg:w-2/5 lg:h-10 flex flex-row justify-center items-center lg:justify-start lg:items-start gap-x-4"
      >
        <button-filter
            title="Easy"
            :is-active="filterActive == 'easy'"
            @click="toggleFilterActive('easy')"
        />
        <button-filter
            title="Medium"
            :is-active="filterActive == 'medium'"
            @click="toggleFilterActive('medium')"
        />
        <button-filter
            title="Hard"
            :is-active="filterActive == 'hard'"
            @click="toggleFilterActive('hard')"
        />
      </div>
      <!--CodeQuestComp Container-->
      <div
          class="flex flex-col lg:flex-row justify-center items-center lg:justify-evenly lg:items-stretch gap-10 w-full"
          data-aos="zoom-in"
          data-aos-duration="1400"
      >
        <div
            id="questcontainer"
            class="w-full lg:w-2/5 h-96 overflow-y-auto overflow-x-hidden bg-gray-400 rounded-3xl mt-4"
            data-aos="zoom-in"
            data-aos-duration="600"
        >
          <code-quest-comp
              v-for="(entry, index) in codequests"
              :quest-id="entry.codequest.id"
              :key="entry.codequest.id"
              :index="index + 1"
              :title="entry.codequest.title"
              :difficulty="entry.codequest.difficulty.name"
              :is-solved="entry.isSolved"
              :deletable="false"
              @expand="expandCodequest(entry.codequest.id)"
          />
        </div>
        <contacts-card
            v-for="contact in contacts"
            :key="contact.name"
            :role="contact.role"
            :links="contact.link"
            :image-url="contact.image"
            :name="contact.name"
            :alt="contact.name + 'Personal contacts info card'"
        />
      </div>
      <!--CodeQuestComp DashboardCard-->
      <span class="h-4 lg:hidden" />
    </div>
  </section>
  <loading-page v-if="isLoading" />
</template>
