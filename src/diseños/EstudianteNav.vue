<template>
  <div>


    <nav class="navbar navbar-expand-lg navbar-dark estudiante-navbar mb-4 shadow-sm">
      <div class="container-fluid">

 
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#EstudianteNavbar"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="EstudianteNavbar">

          <!-- LINKS IZQUIERDA -->
          <ul class="navbar-nav me-auto">

            <li class="nav-item">
              <RouterLink class="nav-link" to="/estudiante">
                Inicio
              </RouterLink>
            </li>

           <li class="nav-item">
              <RouterLink
                v-if="proyectoId"
                class="nav-link"
                :to="{ name: 'DetalleProyecto', params: { id: proyectoId } }"
              >
                Mi Proyecto
              </RouterLink>

              <span v-else class="nav-link disabled">
                Mi Proyecto
              </span>
          </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/explorar">
                Explorar
              </RouterLink>
            </li>
<!-- 
            <li class="nav-item">
              <RouterLink class="nav-link" to="/estudiante/nuevoProyecto">
                Nuevo Proyecto
              </RouterLink>
            </li>
 -->
          </ul>

          <!-- DERECHA -->
          <div class="d-flex align-items-center gap-3">

            <!-- Mini avatar -->
            <img
              v-if="usuario?.foto"
              :src="usuario.foto"
              class="mini-avatar"
            />

            <span class="text-white small">
              {{ usuario?.nombre || "Estudiante" }}
            </span>

            <button
              class="btn btn-outline-light btn-sm"
              @click="cerrarSesion"
            >
              Cerrar sesión
            </button>

          </div>

        </div>
      </div>
    </nav>

    <!-- CONTENIDO -->
    <div class="container">
      <RouterView />
    </div>

  </div>
</template>

<script>
import client from "../sdk"

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

export default {
  name: "EstudianteLayout",

  data() {
    return {
      usuario: null,
      proyectoId: null
    }
  },

async mounted() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return

    const payload = parseJwt(token)
    const cedula = payload?.sub

    const res = await client.usuarios.list()
    this.usuario = res.items.find(u => u.cedula === cedula)

    if (!this.usuario) return

    //  Buscar proyecto del estudiante
    const proyectos = await client.proyectos.list({
      estudiante_id: this.usuario.id
    })

    if (proyectos.items?.length) {
      this.proyectoId = proyectos.items[0].codigo
    }

  } catch (e) {
    console.error("Error cargando usuario navbar:", e)
  }
},


  methods: {
    cerrarSesion() {
      localStorage.clear()
      client.setToken(null)
      this.$router.push("/")
    }
  }
}
</script>

<style scoped>

.estudiante-navbar {
   background: linear-gradient(135deg, #0b5e3c, #146c43);
  border-radius: 14px;
  padding: 10px 16px;
}

.estudiante-navbar .nav-link {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  transition: 0.2s;
}

.estudiante-navbar .nav-link:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.estudiante-navbar .btn-outline-light:hover {
  background: #fff;
  color: #0d6efd;
}

.mini-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

</style>
