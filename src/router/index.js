import { createRouter, createWebHistory } from 'vue-router'
import CharacterizationForm from '../views/characterization/CharacterizationForm.vue'
import ProfileView from '../views/estudiante/ProfileView.vue'
import Login from '../views/auth/Login.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import DocenteDashboard from '../views/docente/DocenteDashboard.vue'
import EstudianteDashboard from '../views/estudiante/EstudianteDashboard.vue'
import ExplorarRepositorio from '../views/estudiante/ExplorarRepositorio.vue'
import UsuariosView from "../views/admin/UsuariosView.vue";
import ProgramasView from "../views/admin/ProgramasView.vue";
import ProyectosView from "../views/admin/ProyectosView.vue";
import NuevoProyecto from '../views/estudiante/NuevoProyecto.vue';
import DetalleProyecto from '../views/estudiante/DetalleProyecto.vue';


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
            meta: { requiresAuth: true, role: 'PROFESOR' }
        },
        {
            path: '/estudiante',
            name: 'estudiante',
            component: EstudianteDashboard,
            meta: { requiresAuth: true, role: 'ESTUDIANTE' }
        },
        {
            path: '/explorar',
            name: 'ExplorarRepositorio',
            component: ExplorarRepositorio,
            meta: { requiresAuth: true, role: 'ESTUDIANTE'}
        },
        {
            path: '/estudiante/NuevoProyecto',
            name: 'NuevoProyecto',
            component: NuevoProyecto,
            meta: { requiresAuth: true, role: 'ESTUDIANTE'}

        },
        {
            path: '/estudiante/detalleproyecto/:id',
            name: 'DetalleProyecto',
            component: DetalleProyecto,
            meta: {requiresAuth: true, role: 'ESTUDIANTE'}

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
        },

        {
        path: "/admin/usuarios",
        name: "admin-usuarios",
        component: UsuariosView,
        meta: { requiresAuth: true, role: "ADMIN" }
        },
        {
        path: "/admin/programas",
        name: "admin-programas",
        component: ProgramasView,
        meta: {
            requiresAuth: true,
            role: "ADMIN"
        }
        },

        {
        path: "/admin/proyectos",
        name: "admin-proyectos",
        component: ProyectosView,
        meta: {
            requiresAuth: true,
            role: "ADMIN"
        }
        },
        
        {
        path: "/admin/roles",
        component: () => import("../views/admin/RolesView.vue"),
        meta: { requiresAuth: true,
             role: "ADMIN" }
        },
        {
        path: "/admin/estudiantes",
        name: "admin-estudiantes",
        component: () => import("../views/admin/EstudiantesView.vue"),
        meta: { requiresAuth: true, role: "ADMIN" }
        }



    ]
})

router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('role')?.toUpperCase()
    const token = localStorage.getItem('token')

    if (to.meta?.requiresAuth) {
        if (!token || !role) {
            next({ name: 'login' })
            return
        }
        if (to.meta.role) {
            if (to.meta.role === 'ADMIN' && role === 'SUPERADMIN') {
                next()
                return
            }
            if (to.meta.role !== role) {
                next({ name: 'login' })
                return
            }
        }
    }

    next()
})

export default router