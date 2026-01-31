import {createRouter, createWebHistory} from 'vue-router'
import CharacterizationForm from '../views/CharacterizationForm.vue'
import profileView from '../views/student/profileView.vue'



const router = createRouter({
    history: createWebHistory (import.meta.env.BASE_URL),
    routes: [
    {
    path: '/',
    name: 'characterization',
    component: CharacterizationForm
    },
    {
        path: '/perfil',
        name: 'perfil',
        component: profileView
    }
    ]
})

export default router