<template>
  <div class="container mt-4">

    <!-- ================= CARDS ================= -->
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


      <!-- Estudiantes -->
      <div class="col-sm-6 col-md-4 d-flex">
        <div
          class="card dashboard-card"
          @click="go('/admin/estudiantes')"
        >
          <div class="card-body text-center">

            <img
              :src="icons.estudiantes"
              class="icon-img"
              alt="Estudiantes"
            />

            <h5>Estudiantes</h5>

            <p class="text-muted">
              Información académica
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
        const res = await client.usuarios.list({
          page: 1,
          pageSize: 1
        });

        this.totalUsuarios = res?.items?.length || 0;

      } catch (e) {
        console.error("Error cargando usuarios", e);
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




/* ================= CARDS ================= */

.dashboard-card {
  width: 100%;
  height: 180px;

  cursor: pointer;
  transition: 0.25s;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(0,0,0,.15);
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


/* ================= ICONOS ================= */

.icon-img {
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
}

</style>
