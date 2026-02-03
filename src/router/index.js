import { createRouter, createWebHistory } from 'vue-router'
import CharacterizationForm from '../views/characterization/CharacterizationForm.vue'
import ProfileView from '../views/estudiante/ProfileView.vue'
import Login from '../views/auth/Login.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import DocenteDashboard from '../views/docente/DocenteDashboard.vue'
import EstudianteDashboard from '../views/estudiante/EstudianteDashboard.vue'

const router = createRouter({
    history: createWebHistory (import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: Login
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminDashboard,
            meta: { requiresAuth: true, role: 'ADMIN' }
        },
        {
            path: '/docente',
            name: 'docente',
            component: DocenteDashboard,
            meta: { requiresAuth: true, role: 'DOCENTE' }
        },
        {
            path: '/estudiante',
            name: 'estudiante',
            component: EstudianteDashboard,
            meta: { requiresAuth: true, role: 'ESTUDIANTE' }
        },
        {
            path: '/characterization',
            name: 'characterization',
            component: CharacterizationForm
        },
        {
            path: '/perfil',
            name: 'perfil',
            component: ProfileView
        }
    ]
})

router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('token')

    if (to.meta?.requiresAuth) {
        if (!token || !role) {
            next({ name: 'login' })
            return
        }
        if (to.meta.role && to.meta.role !== role) {
            next({ name: 'login' })
            return
        }
    }

    next()
})

export default router