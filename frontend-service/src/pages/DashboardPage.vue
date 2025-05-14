<script setup lang="ts">
import ProgressBar from '../components/ProgressBar.vue'
import DashboardCard from '../components/DashboardCard.vue'
import ButtonFilter from '../components/ButtonFilter.vue'
import { onMounted, type Ref, ref } from 'vue'
import CodeQuest from '../components/CodeQuest.vue'
import ContactsCard, { type Link } from '../components/ContactsCard.vue'
import EventNotification from '../components/EventNotification.vue'

export type Person = {
    name: string
    image: string
    role: string
    link: [Link]
}

const filterActive = ref('none')
const toggleFilterActive = (filter: string) =>
    filterActive.value == filter
        ? (filterActive.value = 'none')
        : (filterActive.value = filter)
const errorMessage = ref('')
const contacts: Ref<Person[]> = ref([])

onMounted(async () => {
    try {
        const response = await fetch('/data/contacts.json')
        if (!response.ok) {
            errorMessage.value = "Can't load contacts"
        }
        contacts.value = await response.json()
    } catch (error) {
        errorMessage.value = "Can't load contacts"
        console.error('Errore durante il fetch dei contacts:', error)
    }
})
</script>

<template>
    <section class="lg:ml-16 bg-background dark:bg-bgdark animate-fade-in">
        <!--Title welcome back-->
        <header>
            <h1
                class="text-black text-center lg:text-left text-3xl lg:text-5xl mt-6 dark:text-white lg:ml-4 animate-fade-in"
            >
                Welcome Back 👋🏻,<br />StopRosik
            </h1>
        </header>
        <!--First section-->
        <div
            class="mx-4 md:mx-12 lg:mx-4 mt-4 flex flex-col lg:flex-row lg:items-stretch lg:mt-12 items-center h-full gap-6"
        >
            <!--DashboardCard see profile-->
            <dashboard-card>
                <img
                    src="/images/barney.png"
                    class="w-32 h-32 rounded-lg"
                    alt="Barney Image"
                />
                <button
                    class="text-white bg-primary p-2 w-2/4 mt-6 rounded-xl hover:bg-secondary hover:text-black duration-200"
                >
                    See Profile
                </button>
            </dashboard-card>
            <!--DashboardCard Easy, Medium, Hard-->
            <dashboard-card>
                <progress-bar
                    difficulty="Easy"
                    :current-value="34"
                    :max-value="200"
                />
                <progress-bar
                    difficulty="Medium"
                    :current-value="100"
                    :max-value="250"
                />
                <progress-bar
                    difficulty="Hard"
                    :current-value="80"
                    :max-value="100"
                />
            </dashboard-card>
            <!--DashboardCard Last Trophies-->
            <dashboard-card>
                <h2 class="text-2xl text-white">Last Trophies</h2>
                <img
                    src="/images/trophy-star.png"
                    class="w-32 h-32 object-cover"
                    alt="Trophy Photo"
                />
                <h3 class="text-xl text-white">Code Expert</h3>
            </dashboard-card>
            <!--DashboardCard Level -->
            <dashboard-card>
                <h2 class="text-2xl text-white">Level</h2>
                <img
                    src="/images/project.png"
                    class="w-32 h-32 object-cover"
                    alt="Level Photo"
                />
                <progress
                    class="w-4/5 h-3 [&::-webkit-progress-value]:bg-primary [&::-moz-progress-value]:bg-primary"
                    value="50"
                    max="100"
                />
                <h3 class="text-xl text-white">Code Master</h3>
            </dashboard-card>
        </div>
        <!--Title CodeQuest-->
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
            <!--CodeQuest Container-->
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
                    <code-quest
                        :key="1"
                        :index="1"
                        title="Reverse string"
                        difficulty="Easy"
                        :is-solved="true"
                        data-aos-anchor="#questcontainer"
                    />
                    <code-quest
                        :key="2"
                        :index="2"
                        title="Reverse string"
                        difficulty="Medium"
                        :is-solved="false"
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
                        :is-solved="false"
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

            <!--CodeQuest DashboardCard-->
            <span class="h-4 lg:hidden" />
        </div>
        <!-- Notification -->
        <div class="w-full h-14 flex flex-col justify-center items-center">
            <event-notification
                title="Login Success"
                message="You've been logged in"
                type="success"
            />
        </div>
    </section>
</template>
