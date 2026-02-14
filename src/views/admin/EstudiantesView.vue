<template>
  <div class="container mt-4">

    <!-- Header -->
    <div class="d-flex justify-content-between mb-3">
      <h3>Gestión de Estudiantes</h3>

      <button
        class="btn btn-secondary"
        @click="load"
      >
        Recargar
      </button>
    </div>


    <!-- Filtros -->
    <div class="row mb-3">

      <div class="col-md-6">
        <input
          v-model="search"
          type="text"
          class="form-control"
          placeholder="Buscar por nombre o cédula"
        />
      </div>

    </div>


    <!-- Error -->
    <div
      v-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>


    <!-- Loading -->
    <div
      v-if="loading"
      class="text-muted"
    >
      Cargando estudiantes...
    </div>


    <!-- Sin datos -->
    <div
      v-else-if="filtrados.length === 0"
      class="alert alert-info text-center"
    >
      No hay estudiantes registrados
    </div>


    <!-- Tabla -->
    <div
      v-else
      class="card shadow-sm"
    >

      <table class="table table-hover mb-0">

        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Programa</th>
            <th>Estado</th>
            <th width="120">Acción</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="(e,i) in filtrados"
            :key="e.id"
          >

            <td>{{ i+1 }}</td>
            <td>{{ e.usuario?.nombre }}</td>
            <td>{{ e.usuario?.cedula }}</td>
            <td>{{ e.programa?.nombre }}</td>

            <td>
              <span
                class="badge"
                :class="e.activo ? 'bg-success' : 'bg-danger'"
              >
                {{ e.activo ? "Activo" : "Inactivo" }}
              </span>
            </td>

            <td>

              <button
                class="btn btn-sm"
                :class="e.activo ? 'btn-danger' : 'btn-success'"
                @click="toggle(e)"
              >
                {{ e.activo ? "Desactivar" : "Activar" }}
              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>
</template>


<script>
import client from "../../sdk";

export default {
  name: "EstudiantesView",

  data() {
    return {

      items: [],

      loading: true,
      error: "",

      search: ""
    };
  },


  computed: {

    filtrados() {

      if (!this.search) return this.items;

      const s = this.search.toLowerCase();

      return this.items.filter(e =>
        e.nombre?.toLowerCase().includes(s) ||
        e.cedula?.includes(s)
      );
    }

  },


  async mounted() {
    await this.load();
  },


  methods: {

    async load() {
      this.loading = true;
      this.error = "";

      try {
        const [estRes, userRes, progRes] = await Promise.all([
          client.estudiantes.list({ page: 1, page_size: 500 }),
          client.usuarios.list({ page: 1, page_size: 500 }),
          client.programas.list({ page: 1, page_size: 500 })
        ]);

        const usuarios = userRes.items;
        const programas = progRes.items;

        // Unimos la información
        this.items = estRes.items.map(e => ({
          ...e,
          usuario: usuarios.find(u => u.id === e.usuario_id),
          programa: programas.find(p => p.id === e.programa_id)
        }));

        console.log("ESTUDIANTES UNIDOS:", this.items);

      } catch (e) {
        console.error(e);
        this.error = "Error cargando estudiantes";
      } finally {
        this.loading = false;
      }
    },


    async toggle(e) {

      if (!confirm("¿Cambiar estado?")) return;

      try {

        await client.estudiantes.update(e.id, {
          activo: !e.activo
        });

        await this.load();

      } catch {

        alert("No se pudo actualizar");
      }
    }

  }
};
</script>
