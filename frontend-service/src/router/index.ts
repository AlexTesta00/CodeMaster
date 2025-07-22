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
import AdminPage from '../pages/AdminPage.vue'
import FunctionExamplesPage from "../pages/FunctionExamplesPage.vue";
import { logoutUser } from '../utils/api.ts'
import { errorToast, successToast } from '../utils/notify.ts'
import MonitorPage from "../pages/MonitorPage.vue";

const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/monitor', name: 'Monitor', component: MonitorPage},
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
        path: '/code/:id',
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
        path: '/admin',
        name: 'Admin',
        component: AdminPage,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/banned',
        name: 'Banned',
        component: ErrorPage,
        props: { title: 'You are banned', errorCode: '403' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: ErrorPage,
        props: { title: 'Ops..this is not the right place', errorCode: '404' },
    },
    {
        path: '/examples',
        name: 'SubmitExamples',
        component: FunctionExamplesPage,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, _, next) => {
    const auth = useAuthStore()
    auth.loadNickname()
    auth.loadRole()
    auth.loadBanned()

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isLoggedIn = auth.isLoggedIn()
    const userRole = auth.getUserRole()

    if (requiresAuth && !isLoggedIn) {
        return next({ name: 'Login' })
    }

    if(requiresAuth && auth.banned){
        if (!auth.nickname) return
        try {
            await logoutUser(auth.nickname)
            auth.clearNickname()
            await successToast('User logged out successfully')
            await router.push('/')
        } catch {
            await errorToast('User not logged out')
        }
        return next({ name: 'Banned' })
    }

    if (to.name === 'Dashboard' && userRole === 'admin') {
        return next({ name: 'Admin' })
    }

    if (to.name === 'Login' && isLoggedIn) {
        return next({ name: userRole === 'admin' ? 'Admin' : 'Dashboard' })
    }

    if (to.meta.requiresAdmin && userRole !== 'admin') {
        return next({ name: 'Error', params: { title: 'Forbidden', errorCode: '403' } })
    }

    next()
})

export default router
