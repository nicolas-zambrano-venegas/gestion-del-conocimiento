<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Panel de Administración</h1>
      <button class="btn btn-danger" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <div class="card p-3 shadow-sm">
      <h5 class="mb-3">Usuarios</h5>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else>
        <div class="text-muted mb-2">Total: {{ meta?.total ?? usuarios.length }}</div>
        <ul class="list-group">
          <li class="list-group-item" v-for="usuario in usuarios" :key="usuario.id">
            {{ usuario.nombre }} · {{ usuario.cedula }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "Admin",
  data() {
    return {
      usuarios: [],
      meta: null,
      loading: true
    };
  },
  async mounted() {
    try {
      const { items, meta } = await client.usuarios.list({ page: 1, pageSize: 20 });
      this.usuarios = items;
      this.meta = meta;
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
