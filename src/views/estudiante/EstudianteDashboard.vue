<template>
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
</script>
