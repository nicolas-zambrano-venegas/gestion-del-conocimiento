<template>
  <div class="container mt-4">

    <div class="d-flex justify-content-between mb-3">
      <h3>Gestión de Estudiantes</h3>

      <div class="d-flex gap-2">
        <button
          class="btn btn-secondary"
          @click="load"
        >
          Recargar
        </button>
        <button class="btn btn-primary" @click="$router.back()">
          volver
        </button>

      </div>
    </div>

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

    <div
      v-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>

    <div
      v-if="loading"
      class="text-muted"
    >
      Cargando estudiantes...
    </div>

    <div
      v-else-if="filtrados.length === 0"
      class="alert alert-info text-center"
    >
      No hay estudiantes registrados
    </div>

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
            <th class="text-center">Activo</th>
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

            <td class="text-center">

              <div class="form-check form-switch d-inline-block">

                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="e.usuario?.activo"
                  @change="toggle(e)"
                  style="cursor:pointer;"
                />

              </div>

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
        e.usuario?.nombre?.toLowerCase().includes(s) ||
        e.usuario?.cedula?.includes(s)
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

        this.items = estRes.items.map(e => ({
          ...e,
          usuario: usuarios.find(u => u.id === e.usuario_id),
          programa: programas.find(p => p.id === e.programa_id)
        }));

      } catch (e) {
        console.error(e);
        this.error = "Error cargando estudiantes";
      } finally {
        this.loading = false;
      }
    },

    async toggle(e) {

      const nuevoEstado = !e.usuario.activo;

      try {

        await client.usuarios.update(e.usuario.id, {
          activo: nuevoEstado
        });

        e.usuario.activo = nuevoEstado;

      } catch {
        alert("No se pudo actualizar");
      }
    }

  }
};
</script>
