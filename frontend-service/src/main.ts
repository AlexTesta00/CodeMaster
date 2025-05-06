import { createApp } from 'vue'
import AOS from 'aos'
import './style.css'
import 'aos/dist/aos.css'
import App from './App.vue'

AOS.init()
createApp(App).mount('#app')
