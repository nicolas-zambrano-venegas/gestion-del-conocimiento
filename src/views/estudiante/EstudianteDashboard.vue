<template>
  <div class="container mt-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Panel Estudiante</h2>
      <button class="btn btn-danger" @click="cerrarSesion">
        Cerrar sesion
      </button>
    </div>

    <UserInfoCard
      v-if="estudiante"
      :user="estudiante"
      class="mb-4"
    />
    <UserInfoCard
      v-else
      :user="placeholderUser"
      class="mb-4"
    />

    <div class="row g-4 justify-content-center">


      <div class="col-sm-6 col-md-4 d-flex">
        <div class="card dashboard-card">
          <div class="card-body text-center">
            <h5>Mi Proyecto</h5>

            <div v-if="loading" class="text-muted">
              Cargando...
            </div>

            <div v-else>
              <div v-if="proyecto">
                <div class="fw-bold">{{ proyecto.titulo }}</div>
                <div class="text-muted">Nivel {{ proyecto.nivel }}</div>
              </div>
              <div v-else class="text-muted">
                No tienes proyecto asignado
              </div>
            </div>

          </div>
        </div>
      </div>

      
      <div
        class="col-sm-6 col-md-4 d-flex"
        v-if="proyecto"
      >
        <div
          class="card dashboard-card"
          @click="goDetalleProyecto"
        >
          <div class="card-body text-center">
            <h5>Ver Proyecto</h5>
            <p class="text-muted">Detalles y avances</p>
          </div>
        </div>
      </div>

      
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go({ name: 'ExplorarRepositorio' })"
        >
          <div class="card-body text-center">
            <h5>Explorar Repositorios</h5>
            <p class="text-muted">Lista general de proyectos</p>
          </div>
        </div>
      </div>

     
      <div
        class="col-sm-6 col-md-4 d-flex"
        v-if="!proyecto"
      >
        <div
          class="card dashboard-card"
          @click="go('/estudiante/NuevoProyecto')"
        >
          <div class="card-body text-center">
            <h5>Agregar Proyecto</h5>
            <p class="text-muted">
              Crea tu proyecto si aun no tienes uno
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import client from "../../sdk";
import UserInfoCard from "../../components/user/UserInfoCard.vue";

/* Leer token */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default {
  name: "EstudianteDashboard",

  components: {
    UserInfoCard
  },

  data() {
    return {
      estudiante: null,
      proyecto: null,
      loading: true,
      error: null,

      placeholderUser: {
        nombres: "Cargando...",
        apellidos: "",
        rol: "Estudiante",
        activo: false,
        foto: ""
      }
    };
  },

  async mounted() {
    

    try {
      this.loading = true;

      /* 1️⃣ Leer token */
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay token");
      }

      const payload = parseJwt(token);
      const cedula = payload.sub;

      /* 2️⃣ Traer usuarios */
      const res = await client.usuarios.list();

     

      /* 3️⃣ Buscar usuario actual */
      const usuario = res.items.find(
        u => u.cedula === cedula
      );

    

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      /* 4️⃣ Mapear nombres */
      this.estudiante = {
        ...usuario,
        nombres: usuario.nombre || "",
        apellidos: ""
      };

      /* 5️⃣ Buscar proyecto */
      const proyectos = await client.proyectos.list({
        estudiante_id: this.estudiante.id
      });


      if (proyectos.items && proyectos.items.length) {
        this.proyecto = proyectos.items[0];
      } else {
        this.proyecto = null;
      }

    } catch (e) {
      console.error("Error dashboard:", e);
      this.error = "No se pudo cargar la información";

    } finally {
      this.loading = false;
    }
  },

  methods: {

    goDetalleProyecto() {
      if (!this.proyecto) return;

      this.$router.push({
        name: "DetalleProyecto",
        params: {
          id: this.proyecto.codigo
        }
      });
    },

    go(ruta) {
      this.$router.push(ruta);
    },

    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);
      this.$router.push("/");
    }

  }
};
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  height: 180px;

  cursor: pointer;
  transition: 0.2s;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,.15);
}
</style>
