import { createApp } from 'vue'
import AOS from 'aos'
import './style.css'
import 'aos/dist/aos.css'
import App from './App.vue'
import { loader } from '@guolao/vue-monaco-editor'
import router from './router'
import { initDarkMode } from './utils/dark-mode.ts'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

AOS.init()

const app = createApp(App)

loader.config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
    },
})

initDarkMode()
app.use(VueSweetalert2)
app.use(router).mount('#app')
