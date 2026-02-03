<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Panel Profesor</h1>
      <button class="btn btn-danger" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <div class="card p-3 shadow-sm">
      <h5 class="mb-3">Proyectos asignados</h5>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else>
        <ul class="list-group">
          <li class="list-group-item" v-for="proyecto in proyectos" :key="proyecto.codigo">
            {{ proyecto.titulo }} · Nivel {{ proyecto.nivel }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "Docente",
  data() {
    return {
      proyectos: [],
      loading: true
    };
  },
  async mounted() {
    try {
      const { items } = await client.proyectos.list({ page: 1, pageSize: 50 });
      this.proyectos = items;
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
