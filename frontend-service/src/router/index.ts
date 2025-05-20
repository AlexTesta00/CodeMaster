import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import CodePage from '../pages/CodePage.vue'
import ErrorPage from '../pages/ErrorPage.vue'
import NewCodeQuestPage from '../pages/NewCodeQuestPage.vue'
import ChoicePage from '../pages/ChoicePage.vue'

const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/dashboard', name: 'Dashboard', component: DashboardPage },
    { path: '/profile', name: 'Profile', component: ProfilePage },
    { path: '/settings', name: 'Settings', component: SettingsPage },
    { path: '/code', name: 'Code', component: CodePage },
    { path: '/error', name: 'Error', component: ErrorPage },
    { path: '/codequest', name: 'CodeQuest', component: NewCodeQuestPage },
    { path: '/choice', name: 'Choice', component: ChoicePage },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: ErrorPage,
        props: { title: 'Ops..this is not the right place', errorCode: 404 },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
