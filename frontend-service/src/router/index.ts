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
import { useAuthStore } from '../utils/store.ts'

const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/login', name: 'Login', component: LoginPage },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: SettingsPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/code',
        name: 'Code',
        component: CodePage,
        meta: { requiresAuth: true },
    },
    {
        path: '/error',
        name: 'Error',
        component: ErrorPage,
        props: { title: 'Service temporary not available', errorCode: '500' },
    },
    {
        path: '/codequest',
        name: 'CodeQuest',
        component: NewCodeQuestPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/choice',
        name: 'Choice',
        component: ChoicePage,
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: ErrorPage,
        props: { title: 'Ops..this is not the right place', errorCode: '404' },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, _, next) => {
    const auth = useAuthStore()
    auth.loadNickname()

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !auth.isLoggedIn()) {
        return next({ name: 'Login' })
    }

    if (to.name === 'Login' && auth.isLoggedIn()) {
        return next({ name: 'Dashboard' })
    }

    next()
})

export default router
