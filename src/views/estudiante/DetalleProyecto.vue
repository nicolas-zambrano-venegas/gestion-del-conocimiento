<template>
  <div class="container mt-4" v-if="proyecto">

    <h3 class="mb-4">Detalle del Proyecto</h3>

    <!-- DATOS PROYECTO -->
    <div class="card shadow-sm mb-4 p-3">
      <h5>{{ proyecto.titulo }}</h5>
      <p><strong>Nivel:</strong> {{ proyecto.nivel }}</p>
      <p><strong>Estado:</strong> {{ estadoNombre(proyecto.estado_id) }}</p>
    </div>

    <!-- EVIDENCIAS -->
    <h5>Evidencias</h5>

    <div
      v-if="evidencias.length === 0"
      class="alert alert-info"
    >
      No hay evidencias registradas.
    </div>

    <div
      v-for="e in evidencias"
      :key="e.id"
      class="card mb-3 p-3 shadow-sm"
    >
      <p><strong>Descripción:</strong> {{ e.descripcion }}</p>
      <p>
        <strong>Documento:</strong>
        <a :href="e.url_pdf" target="_blank">Ver documento</a>
      </p>
    </div>

    <!-- RETROALIMENTACIÓN -->
    <h5 class="mt-4">Retroalimentación del Docente</h5>

    <div
      v-if="calificaciones.length === 0"
      class="alert alert-warning"
    >
    
      Aún no hay calificaciones.
    </div>

    <div
      v-for="c in calificaciones"
      :key="c.id"
      class="card p-3 mb-3 shadow-sm"
    >
      <p>
        <strong>Profesor:</strong>
        {{ nombreProfesor(c.profesor_id) }}
      </p>

      <p>
        <strong>Nota:</strong>
        {{ c.nota ?? 'Sin nota' }}
      </p>

      <p>
        <strong>Observaciones:</strong>
        {{ c.observaciones || 'Sin observaciones' }}
      </p>
    </div>

  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "DetalleProyecto",

  data() {
    return {
      proyecto: null,
      evidencias: [],
      calificaciones: [],
      usuarios: [],
      estados: []
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {

    async load() {
      try {
        const proyectoId = this.$route.params.id;
        
        // PROYECTO
        this.proyecto = await client.proyectos.get(proyectoId);

        // USUARIOS
        const usuariosRes = await client.usuarios.list();
        this.usuarios = usuariosRes.items;

        // ESTADOS
        const estadosRes = await client.estados.list();
        this.estados = estadosRes.items;

        // EVIDENCIAS
        const evidenciasRes = await client.evidencias.list();
        this.evidencias = evidenciasRes.items.filter(
          e => Number(e.proyecto_id) === Number(proyectoId)
        );

        // CALIFICACIONES
        const calificacionesRes = await client.calificaciones.list();
        const evidenciaIds = this.evidencias.map(e => e.id);

        this.calificaciones = calificacionesRes.items.filter(
          c => evidenciaIds.includes(c.evidencia_id)
        );

        console.log("CALIFICACIONES:", this.calificaciones);

      } catch (error) {
        console.error("Error cargando detalle:", error);
      }
    },

    nombreProfesor(profesorId) {
      const profesor = this.usuarios.find(
        u => Number(u.id) === Number(profesorId)
      );
      return profesor?.nombre || "Profesor";
    },

    estadoNombre(estadoId) {
      const estado = this.estados.find(
        e => Number(e.id) === Number(estadoId)
      );
      return estado?.nombre || estadoId;
    }

  }
};
</script>
