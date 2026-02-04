<!-- <template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Panel Estudiante</h1>
      <button class="btn btn-danger" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <div class="card p-3 shadow-sm">
      <h5 class="mb-3">Proyecto asignado</h5>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else>
        <div v-if="proyecto">
          <strong>{{ proyecto.titulo }}</strong>
          <div class="text-muted">Nivel {{ proyecto.nivel }}</div>
        </div>
        <div v-else class="text-muted">No tienes proyecto asignado.</div>
      </div>
    </div>
  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "Estudiante",
  data() {
    return {
      proyecto: null,
      loading: true
    };
  },
  async mounted() {
    try {
      const estudiante = await client.estudiante;
      if (estudiante) {
        this.proyecto = await estudiante.proyecto;
      }
    } finally {
      this.loading = false;
    }
  },
  methods: {
    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);
      this.$router.push("/");
    }
  }
};
</script> -->

<template>
  <div class="container mt-5">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Panel Estudiante</h1>
      <button class="btn btn-danger" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <!-- Cards -->
    <div class="row g-4">

      <!-- Mi Proyecto -->
      <div class="col-md-4">
        <div class="card shadow dashboard-card">
          <div class="card-body text-center">
            <h5>📘 Mi Proyecto</h5>

            <div v-if="loading" class="text-muted">Cargando...</div>

            <div v-else>
              <div v-if="proyecto">
                <div class="fw-bold">{{ proyecto.titulo }}</div>
                <div class="text-muted">Nivel {{ proyecto.nivel }}</div>
              </div>
              <div v-else class="text-muted">No tienes proyecto asignado</div>
            </div>
          </div>
        </div>
      </div>
      

      <!-- Ver Proyecto / Detalles -->
      <div class="col-md-4" v-if="proyecto">
        <div class="card shadow dashboard-card" @click="go('/estudiante/proyecto')">
          <div class="card-body text-center">
            <h5>🔍 Ver Proyecto</h5>
            <p class="text-muted">Detalles y avances</p>
          </div>
        </div>
      </div>

      <!-- Explorar Repositorios -->
      <div class="col-md-4">
        <div class="card shadow dashboard-card" @click="go({name: 'ExplorarRepositorio'})">
          <div class="card-body text-center">
            <h5>📂 Explorar Repositorios</h5>
            <p class="text-muted">Lista general de proyectos</p>
          </div>
        </div>
      </div>

      <!-- Agregar Proyecto (condicional) -->
      <div class="col-md-4" v-if="!proyecto">
        <div class="card shadow dashboard-card" @click="go('/estudiante/nuevo-proyecto')">
          <div class="card-body text-center">
            <h5>➕ Agregar Proyecto</h5>
            <p class="text-muted">Crea tu proyecto si aún no tienes uno</p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "EstudianteDashboard",
  data() {
    return {
      proyecto: null,
      loading: true,
      error: null
    };
  },
  async mounted() {
    try {
      const estudiante = await client.estudiante;
      if (estudiante) {
        this.proyecto = await estudiante.proyecto;
      }
    } catch (e) {
      console.error(e);
      this.error = "No se pudo cargar la información del proyecto";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    go(path) {
      this.$router.push(path);
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
  cursor: pointer;
  transition: all 0.25s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  background: #f8f9fa;
}
</style>
