import { createApp } from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import {routes} from './routes'
import App from './App.vue'
import Footer from './components/Footer.vue'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.component('Footer', Footer)
app.config.globalProperties.$apiURL = import.meta.env.VITE_API_URL
app.use(router)
app.mount('#app')