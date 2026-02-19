<template>
  <div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Gestión de Proyectos</h2>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="load">
          Recargar
        </button>
        <button class="btn btn-primary" @click="$router.back()">
          volver
        </button>


      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="text-muted">
      Cargando proyectos...
    </div>

    <div
      v-if="!loading && items.length === 0"
      class="alert alert-info text-center"
    >
      📭 No hay proyectos registrados aún.
    </div>

    <div v-else-if="!loading" class="card shadow-sm">

      <table class="table table-hover mb-0">

        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Estudiante</th>
            <th>Programa</th>
            <th>Asesor</th>
            <th>Estado</th>
            <th width="120">Editar</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="(p,i) in items" :key="p.id">

            <td>{{ i+1 }}</td>
            <td>{{ p.titulo }}</td>
            <td>{{ p.estudiante?.nombre }}</td>
            <td>{{ p.programa?.nombre }}</td>
            <td>{{ p.docente?.nombre || "—" }}</td>

            <td style="width:200px">

              <select
                class="form-select form-select-sm"
                :value="p.estado_id"
                @change="changeEstado(p, $event)"
              >
                <option
                  v-for="e in estados"
                  :key="e.id"
                  :value="e.id"
                >
                  {{ e.nombre }}
                </option>
              </select>

            </td>

            <td>
              <button
                class="btn btn-sm btn-primary"
                @click="edit(p)"
              >
                Editar
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

  name: "ProyectosView",

  data() {
    return {
      items: [],
      estados: [],
      loading: true,
      error: ""
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {

    async load() {

      this.loading = true;
      this.error = "";

      try {

        const [proyRes, estadosRes] = await Promise.all([
          client.proyectos.list({
            page: 1,
            pageSize: 200
          }),
          client.estados.list()
        ]);

        this.items = proyRes.items;
        this.estados = estadosRes.items;

      } catch {

        this.error = "Error cargando proyectos";

      } finally {

        this.loading = false;
      }
    },

    edit(p) {
      alert("Editar: " + p.titulo);
    },

    async changeEstado(p, event) {

      const nuevo = Number(event.target.value);

      try {

        await client.proyectos.update(p.id,{
          estado_id: nuevo
        });

        p.estado_id = nuevo;
        p.estado = this.estados.find(e => e.id === nuevo);

      } catch {

        alert("No se pudo cambiar estado");
      }
    }

  }
};
</script>
