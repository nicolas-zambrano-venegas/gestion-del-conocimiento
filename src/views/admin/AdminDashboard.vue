<template>
  <div class="container mt-5">

    <!-- Header -->
    <div
      class="d-flex justify-content-between align-items-center mb-4"
    >
      <h2>Panel de Administración</h2>

      <button
        class="btn btn-danger"
        @click="cerrarSesion"
      >
        Cerrar sesión
      </button>
    </div>


    <!-- Cards -->
    <div class="row g-4 justify-content-center">

      <!-- Usuarios -->
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/usuarios')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.usuario"
              class="icon-img"
              alt="Usuarios"
            />

            <h5>Usuarios</h5>

            <p class="text-muted">
              Total: {{ totalUsuarios }}
            </p>

          </div>
        </div>
      </div>


      <!-- Programas -->
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/programas')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.programas"
              class="icon-img"
              alt="Programas"
            />

            <h5>Programas</h5>

            <p class="text-muted">
              Gestión académica
            </p>

          </div>
        </div>
      </div>


      <!-- Proyectos -->
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/proyectos')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.proyectos"
              class="icon-img"
              alt="Proyectos"
            />

            <h5>Proyectos</h5>

            <p class="text-muted">
              Seguimiento
            </p>

          </div>
        </div>
      </div>


      <!-- Roles -->
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/roles')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.roles"
              class="icon-img"
              alt="Roles"
            />

            <h5>Roles</h5>

            <p class="text-muted">
              Permisos
            </p>

          </div>
        </div>
      </div>

      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/estudiantes')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.estudiantes"
              class="icon-img"
              alt="Roles"
            />

            <h5>Estudiantes</h5>

            <p class="text-muted">
              Permisos
            </p>

          </div>
        </div>
      </div>

    </div>

  </div>
</template>


<script>
import client from "../../sdk";
import { icons } from "../../constants/icons";

export default {
  name: "AdminDashboard",

  data() {
    return {
      totalUsuarios: 0,
      icons
    };
  },

  async mounted() {
    await this.cargarUsuarios();
  },

  methods: {

    async cargarUsuarios() {
      try {
        const { meta } = await client.usuarios.list({
          page: 1,
          pageSize: 1
        });

        this.totalUsuarios = meta?.total || 0;

      } catch {
        this.totalUsuarios = 0;
      }
    },


    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);

      this.$router.push("/");
    },


    go(ruta) {
      this.$router.push(ruta);
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



/* Hover */
.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,.15);
}


/* Iconos */
.icon-img {
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
}

</style>
