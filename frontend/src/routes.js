import Home from './components/Home.vue'
import Font from './components/Font.vue'

export const routes = [
  {path: '/', component: Home, name: 'Home'},
  {path: '/font/:fontFamily', component: Font, name: 'Font'}
]