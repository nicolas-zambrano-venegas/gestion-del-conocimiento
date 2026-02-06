<template>
  <div class="container mt-5">

    <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Gestión de Usuarios</h2>

    <div class="d-flex gap-2">
      <button class="btn btn-secondary" @click="volver">
        volver
      </button>

      <button class="btn btn-danger" @click="cerrarSesion">
        Cerrar sesión
      </button>
    </div>
  </div>

    <!-- Filtros -->
    <div class="card p-3 mb-3">

    <div class="row g-2">

        <!-- Buscar -->
        <div class="col-md-6">
        <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Buscar por nombre..."
        />
        </div>

        <!-- Rol -->
        <div class="col-md-4">
        <select v-model.number="rolFilter" class="form-select">
            <option :value="0">Todos los roles</option>
            <option :value="1">Estudiante</option>
            <option :value="2">Profesor</option>
            <option :value="3">Admin</option>
            <option :value="4">SuperAdmin</option>
        </select>
        </div>

        <!-- Reset -->
        <div class="col-md-2">
        <button
            class="btn btn-secondary w-100"
            @click="resetFilters"
        >
            Limpiar
        </button>
        </div>

    </div>

    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-muted">
      Cargando usuarios...
    </div>

    <!-- Tabla -->
    <div v-else class="card shadow-sm">

      <div class="card-body p-0">

        <table class="table table-hover mb-0">

          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th class="text-center">Activo</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(u, i) in usuariosFiltrados" :key="u.id">


              <td>{{ i + 1 }}</td>

              <td>{{ u.nombre }}</td>

              <td>
                <span
                  class="badge"
                  :class="rolClass(u.rol_id)"
                >
                  {{ rolTexto(u.rol_id) }}
                </span>
              </td>

              <td class="text-center">

                <div class="form-check form-switch d-inline-block">

                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="u.activo"
                    @change="toggleActivo(u)"
                    :disabled="savingId === u.id"
                  />

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>
    </div>

  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "UsuariosTabla",

  data() {
    return {
      usuarios: [],
      loading: true,
      error: "",
      savingId: null,
      search: "",
      rolFilter: 0
    };
  },

  async mounted() {
    console.log("MOUNTED OK");
    await this.loadUsuarios();
  },
  computed: {

    usuariosFiltrados() {

        return this.usuarios.filter(u => {

        const nombreOk =
            u.nombre
            .toLowerCase()
            .includes(this.search.toLowerCase());

        const rolOk =
            this.rolFilter === 0 ||
            u.rol_id === this.rolFilter;

        return nombreOk && rolOk;
        });

    }
    },

  methods: {

    async loadUsuarios() {
        console.log("CARGANDO USUARIOS...");
      this.loading = true;
      this.error = "";

      try {
        const { items } = await client.usuarios.list({
          page: 1,
          pageSize: 500
        });

        this.usuarios = items;

      } catch (err) {

        this.error =
          err?.data?.detail ||
          err.message ||
          "Error cargando usuarios";

      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
    this.search = "";
    this.rolFilter = 0;
    },

      //  Activar / Desactivar
  
    async toggleActivo(usuario) {

      const nuevoEstado = !usuario.activo;

      this.savingId = usuario.id;

      try {

        await client.usuarios.update(usuario.id, {
          activo: nuevoEstado
        });

       
        usuario.activo = nuevoEstado;

      } catch (err) {

        this.error =
          err?.data?.detail ||
          err.message ||
          "Error actualizando usuario";

      } finally {
        this.savingId = null;
      }
    },


    /* =====================
       Rol helpers
    ===================== */
    rolTexto(rolId) {

      switch (rolId) {
        case 1: return "ESTUDIANTE";
        case 2: return "PROFESOR";
        case 3: return "ADMIN";
        case 4: return "SUPERADMIN";
        default: return "DESCONOCIDO";
      }

    },

    rolClass(rolId) {

      switch (rolId) {
        case 1: return "bg-secondary";
        case 2: return "bg-primary";
        case 3: return "bg-warning text-dark";
        case 4: return "bg-danger";
        default: return "bg-dark";
      }

    },


    volver() {
      this.$router.push("/admin"); 
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

.table th,
.table td {
  vertical-align: middle;
}

.form-switch .form-check-input {
  cursor: pointer;
}

</style>
