<template>
  <div class="container mt-4">

    <!-- Header -->
    <div class="d-flex justify-content-between mb-3">

      <h2>Gestión de Proyectos</h2>

      <button class="btn btn-secondary" @click="load">
        Recargar
      </button>

    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-muted">
      Cargando proyectos...
    </div>

    <!-- Tabla -->
    <!-- Sin datos -->
<div
  v-if="!loading && items.length === 0"
  class="alert alert-info text-center"
>
  📭 No hay proyectos registrados aún.
</div>

<!-- Tabla -->
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
        <th width="160">Acción</th>
      </tr>
    </thead>

    <tbody>

      <tr v-for="(p,i) in items" :key="p.id">

        <td>{{ i+1 }}</td>
        <td>{{ p.titulo }}</td>
        <td>{{ p.estudiante?.nombre }}</td>
        <td>{{ p.programa?.nombre }}</td>
        <td>{{ p.docente?.nombre || "—" }}</td>

        <td>
          <span
            class="badge"
            :class="estadoClass(p.estado?.nombre)"
          >
            {{ p.estado?.nombre }}
          </span>
        </td>

        <td>
          <button
            class="btn btn-sm btn-primary me-1"
            @click="edit(p)"
          >
            Editar
          </button>

          <button
            class="btn btn-sm btn-warning"
            @click="changeEstado(p)"
          >
            Estado
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

        const { items } = await client.proyectos.list({
          page: 1,
          pageSize: 200
        });

        this.items = items;

      } catch(e) {

        this.error = "Error cargando proyectos";

      } finally {

        this.loading = false;
      }
    },


    edit(p) {

      alert("Editar: " + p.titulo);

      // Luego abrimos modal
    },


    async changeEstado(p) {

      const nuevo = prompt(
        "Nuevo estado ID:",
        p.estado_id
      );

      if (!nuevo) return;

      try {

        await client.proyectos.update(p.id,{
          estado_id: Number(nuevo)
        });

        await this.load();

      } catch(e) {

        alert("No se pudo cambiar estado");
      }
    },


    estadoClass(nombre) {

      switch(nombre){

        case "Propuesta": return "bg-secondary";
        case "En curso": return "bg-primary";
        case "Finalizado": return "bg-success";
        case "Rechazado": return "bg-danger";

        default: return "bg-dark";
      }
    }

  }
};
</script>
