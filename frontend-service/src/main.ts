import { createApp } from 'vue'
import AOS from 'aos'
import './style.css'
import 'aos/dist/aos.css'
import App from './App.vue'
import { loader } from '@guolao/vue-monaco-editor'

AOS.init()

const app = createApp(App)

loader.config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
    },
})

app.mount('#app')
