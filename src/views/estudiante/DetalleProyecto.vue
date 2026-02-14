<template>
  <div class="detalle-wrapper" v-if="proyecto">

    <div class="container py-4">

      <!-- HEADER -->
      <div class="header-box mb-4">

        <div>
          <h2 class="mb-1 fw-bold">
            {{ proyecto.titulo }}
          </h2>
          <small class="text-muted">
            Nivel {{ proyecto.nivel }}
          </small>
        </div>

        <span
          class="badge estado-badge"
          :class="estadoClass(estadoNombre(proyecto.estado_id))"
        >
          {{ estadoNombre(proyecto.estado_id) }}
        </span>

      </div>

      <!-- GRID -->
      <div class="row g-4">

        <!-- IZQUIERDA -->
        <div class="col-lg-7">

          <!-- EVIDENCIAS -->
          <div class="section-card">

            <h5 class="section-title">
              📂 Evidencias
            </h5>

            <div
              v-if="evidencias.length === 0"
              class="empty-box"
            >
              No hay evidencias registradas.
            </div>

            <div
              v-for="e in evidencias"
              :key="e.id"
              class="evidencia-card"
            >
              <div>
                <p class="fw-semibold mb-1">
                  {{ e.descripcion }}
                </p>
              </div>

              <a
                :href="e.url_pdf"
                target="_blank"
                class="btn btn-outline-success btn-sm"
              >
                Ver documento
              </a>
            </div>

          </div>

        </div>

        <!-- DERECHA -->
        <div class="col-lg-5">

          <div class="section-card">

            <h5 class="section-title">
              🎓 Retroalimentación
            </h5>

            <div
              v-if="calificaciones.length === 0"
              class="empty-box warning"
            >
              Aún no hay calificaciones.
            </div>

            <div
              v-for="c in calificaciones"
              :key="c.id"
              class="feedback-card"
            >

              <div class="d-flex justify-content-between align-items-center mb-2">

                <div class="fw-semibold">
                  {{ nombreProfesor(c.profesor_id) }}
                </div>

                <div
                  class="nota-circle"
                  :class="notaClass(c.nota)"
                >
                  {{ c.nota ?? "-" }}
                </div>

              </div>

              <p class="text-muted small mb-0">
                {{ c.observaciones || "Sin observaciones" }}
              </p>

            </div>

          </div>

        </div>

      </div>

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

      const proyectoId = this.$route.params.id;

      const [proyecto, usuariosRes, estadosRes, evidenciasRes, calificacionesRes] =
        await Promise.all([
          client.proyectos.get(proyectoId),
          client.usuarios.list(),
          client.estados.list(),
          client.evidencias.list(),
          client.calificaciones.list()
        ]);

      this.proyecto = proyecto;
      this.usuarios = usuariosRes.items;
      this.estados = estadosRes.items;

      this.evidencias = evidenciasRes.items.filter(
        e => Number(e.proyecto_id) === Number(proyectoId)
      );

      const evidenciaIds = this.evidencias.map(e => e.id);

      this.calificaciones = calificacionesRes.items.filter(
        c => evidenciaIds.includes(c.evidencia_id)
      );
    },

    nombreProfesor(profesorId) {
      const profesor = this.usuarios.find(
        u => Number(u.id) === Number(profesorId)
      );
      return profesor?.nombre || "Profesor";
    },

    estadoNombre(id) {
      const estado = this.estados.find(
        e => Number(e.id) === Number(id)
      );
      return estado?.nombre || id;
    },

    estadoClass(nombre) {
      switch(nombre){
        case "Propuesta": return "bg-secondary";
        case "En curso": return "bg-primary";
        case "Finalizado": return "bg-success";
        case "Rechazado": return "bg-danger";
        default: return "bg-dark";
      }
    },

    notaClass(nota){
      if (nota == null) return "bg-secondary";
      if (nota >= 4.5) return "bg-success";
      if (nota >= 3) return "bg-warning";
      return "bg-danger";
    }

  }
};
</script>

<style scoped>

.detalle-wrapper {
  background: linear-gradient(180deg, #f8fafc, #eef2f7);
  min-height: 100vh;
}

.header-box {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.estado-badge {
  padding: 0.6rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
}

.section-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.section-title {
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.evidencia-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  background: #f9fafb;
  margin-bottom: 0.8rem;
  transition: 0.2s ease;
}

.evidencia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.feedback-card {
  padding: 1rem;
  border-radius: 12px;
  background: #f9fafb;
  margin-bottom: 1rem;
}

.nota-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.empty-box {
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  color: #6b7280;
}

.empty-box.warning {
  background: #fff8e1;
  border-color: #ffc107;
}

</style>
