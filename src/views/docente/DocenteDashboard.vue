<template>
  <div class="container mt-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-white border rounded px-3 mb-4">
      <span class="navbar-brand fw-bold">Panel Docente</span>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#docenteNavbar"
        aria-controls="docenteNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="docenteNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#todos-proyectos">Todos los proyectos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#asignados">Proyectos asignados</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#perfil">Perfil</a>
          </li>
        </ul>
        <button class="btn btn-danger" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <section id="todos-proyectos" class="mb-5">
      <h3 class="mb-3">Todos los proyectos</h3>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else class="table-responsive">
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="allProjects.length === 0">
              <td colspan="5" class="text-center text-muted">No hay proyectos registrados</td>
            </tr>
            <tr v-for="proyecto in allProjects" :key="proyecto.codigo">
              <td>{{ proyecto.codigo }}</td>
              <td>{{ proyecto.titulo }}</td>
              <td>{{ proyecto.nivel }}</td>
              <td>{{ estadoNombre(proyecto.estado_id) }}</td>
              <td>
                <span class="badge" :class="proyecto.activo ? 'bg-success' : 'bg-secondary'">
                  {{ proyecto.activo ? 'Sí' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="asignados" class="mb-5">
      <h3 class="mb-3">Proyectos asignados</h3>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else class="docente-cards">
        <div v-if="assignedProjects.length === 0" class="text-center text-muted">
          No hay proyectos asignados
        </div>

        <article v-for="proyecto in assignedProjects" :key="proyecto.codigo" class="docente-card docente-card--compact shadow-sm">
          <div class="docente-card__header">
            <div></div>
            <div class="docente-card__right">Proyecto #{{ proyecto.codigo }}</div>
          </div>

          <div class="docente-card__body">
            <div class="docente-card__left">
              <div class="docente-card__avatar">
                <img
                  :src="primaryAutor(proyecto)?.foto || 'https://via.placeholder.com/140'"
                  alt="Foto estudiante"
                />
              </div>
              <div class="docente-card__meta">
                <div class="fw-semibold">{{ primaryAutor(proyecto)?.nombre || 'Sin autor' }}</div>
              </div>
            </div>

            <div class="docente-card__main">
              <div class="docente-card__section">
                <div class="docente-card__title">
                  {{ primaryAutor(proyecto)?.nombre || 'Sin autor' }} / {{ proyecto.titulo }}
                </div>
                <div class="docente-card__line">
                  <span class="docente-card__label-inline">Descripción</span>
                  <span>{{ proyecto.titulo }}</span>
                </div>
                <div class="docente-card__line" v-if="evidenciasByProyecto[proyecto.codigo]?.length">
                  <span class="docente-card__label-inline">Evidencia</span>
                  <a :href="evidenciasByProyecto[proyecto.codigo][0].url_pdf" target="_blank">
                    {{ evidenciasByProyecto[proyecto.codigo][0].url_pdf }}
                  </a>
                </div>
                <div class="docente-card__line" v-else>
                  <span class="docente-card__label-inline">Evidencia</span>
                  <span>Sin evidencia</span>
                </div>
              </div>

              <div class="docente-card__section">
                <div class="docente-card__section-title">Observación</div>
                <textarea
                  v-model="calificacionesForm[proyecto.codigo].observaciones"
                  class="form-control docente-card__observacion-input"
                  rows="2"
                ></textarea>
              </div>

              <div class="docente-card__footer">
                <div class="docente-card__footer-left">
                  <div><span class="docente-card__label-inline">Programa</span>{{ primaryAutor(proyecto)?.programa || 'Sin programa' }}</div>
                  <div><span class="docente-card__label-inline">Tema</span>Sin tema</div>
                </div>
                <div class="docente-card__footer-right">
                  <label class="form-label mb-1">Nota</label>
                  <input
                    v-model.number="calificacionesForm[proyecto.codigo].nota"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    class="form-control docente-card__nota-input"
                    required
                  />
                  <button
                    class="btn btn-primary btn-sm docente-card__guardar"
                    type="button"
                    :disabled="submitting[proyecto.codigo]"
                    @click="calificar(proyecto)"
                  >
                    {{ submitting[proyecto.codigo] ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="perfil" class="mb-5">
      <h3 class="mb-3">Perfil</h3>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else class="row g-4">
        <div class="col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <img
                :src="usuario?.foto || 'https://via.placeholder.com/150'"
                class="rounded-circle mb-3"
                width="150"
                alt="Foto de perfil"
              />
              <h5 class="mb-0">{{ usuario?.nombre || 'Sin nombre' }}</h5>
              <small class="text-muted">Rol: {{ rolNombre(usuario?.rol_id) }}</small>
              <div class="mt-2">
                <span class="badge" :class="usuario?.activo ? 'bg-success' : 'bg-secondary'">
                  {{ usuario?.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="mb-3">Datos completos del usuario</h5>
              <div class="row">
                <div class="col-md-6 mb-2"><strong>ID:</strong> {{ usuario?.id ?? '-' }}</div>
                <div class="col-md-6 mb-2"><strong>Nombre:</strong> {{ usuario?.nombre ?? '-' }}</div>
                <div class="col-md-6 mb-2"><strong>Cédula:</strong> {{ usuario?.cedula ?? '-' }}</div>
                <div class="col-md-6 mb-2"><strong>Foto:</strong> {{ usuario?.foto ?? '-' }}</div>
                <div class="col-md-6 mb-2"><strong>Activo:</strong> {{ usuario?.activo }}</div>
                <div class="col-md-6 mb-2"><strong>Rol:</strong> {{ rolNombre(usuario?.rol_id) }}</div>
                <div class="col-md-12 mb-2"><strong>Password:</strong> {{ usuario?.password ?? '-' }}</div>
              </div>

              <h5 class="mt-4 mb-3">Datos de profesor</h5>
              <div class="row">
                <div class="col-md-6 mb-2"><strong>Usuario:</strong> {{ profesorNombre || '-' }}</div>
                <div class="col-md-6 mb-2"><strong>Curso asignado (grupo):</strong> {{ profesor?.curso_asignado ?? '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "DocenteDashboard",
  data() {
    return {
      allProjects: [],
      assignedProjects: [],
      usuario: null,
      profesor: null,
      estados: [],
      evidencias: [],
      calificaciones: [],
      programas: [],
      autoresByProyecto: {},
      evidenciasByProyecto: {},
      calificacionesByProyecto: {},
      calificacionesForm: {},
      observacionEditable: {},
      submitting: {},
      loading: true
    };
  },
  computed: {
    profesorNombre() {
      return this.usuario?.nombre || "";
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.usuario = await client.usuario;
        if (this.usuario?.id) {
          this.profesor = await client.getProfesor(this.usuario.id).catch(() => null);
        }

        const [proyectosRes, estadosRes, evidenciasRes, usuariosRes, calificacionesRes, programasRes] = await Promise.all([
          client.proyectos.list({ page: 1, pageSize: 200 }),
          client.estados.list(),
          client.evidencias.list(),
          client.usuarios.list(),
          client.calificaciones.list(),
          client.programas.list()
        ]);

        this.allProjects = proyectosRes.items;
        this.estados = estadosRes.items || [];
        this.evidencias = evidenciasRes.items || [];
        this.calificaciones = calificacionesRes.items || [];
        this.programas = programasRes.items || [];

        const grupo = this.profesor?.curso_asignado ?? null;
        if (grupo !== null && grupo !== undefined) {
          this.assignedProjects = this.allProjects.filter((item) => Number(item.nivel) === Number(grupo));
        } else {
          this.assignedProjects = [];
        }

        const usuariosMap = new Map((usuariosRes.items || []).map((u) => [u.id, u]));
        const programasMap = new Map((this.programas || []).map((p) => [p.id, p.nombre]));
        const autoresByProyecto = {};
        for (const proyecto of this.assignedProjects) {
          const estudiantes = await client.proyectos.getEstudiantes(proyecto.codigo).catch(() => []);
          autoresByProyecto[proyecto.codigo] = estudiantes.map((est) => {
            const usuario = usuariosMap.get(est.usuario_id);
            return {
              id: est.id,
              nombre: usuario?.nombre || "Sin nombre",
              foto: usuario?.foto || null,
              usuario_id: est.usuario_id,
              programa: programasMap.get(est.programa_id) || null
            };
          });
        }
        this.autoresByProyecto = autoresByProyecto;

        const evidenciasByProyecto = {};
        for (const evidencia of this.evidencias) {
          const proyectoId = evidencia.proyecto_id;
          if (!evidenciasByProyecto[proyectoId]) evidenciasByProyecto[proyectoId] = [];
          evidenciasByProyecto[proyectoId].push(evidencia);
        }
        this.evidenciasByProyecto = evidenciasByProyecto;

        const calificacionesByProyecto = {};
        const evidenciaToProyecto = new Map();
        for (const evidencia of this.evidencias) {
          evidenciaToProyecto.set(evidencia.id, evidencia.proyecto_id);
        }
        const profesorId = this.profesor?.usuario_id ?? null;
        for (const calificacion of this.calificaciones) {
          if (profesorId && Number(calificacion.profesor_id) !== Number(profesorId)) {
            continue;
          }
          const proyectoId = evidenciaToProyecto.get(calificacion.evidencia_id);
          if (!proyectoId) continue;
          if (!calificacionesByProyecto[proyectoId]) calificacionesByProyecto[proyectoId] = [];
          const profesorUsuario = usuariosMap.get(calificacion.profesor_id);
          calificacionesByProyecto[proyectoId].push({
            ...calificacion,
            profesorNombre: profesorUsuario?.nombre || null
          });
        }
        this.calificacionesByProyecto = calificacionesByProyecto;

        const form = {};
        const submitting = {};
        const observacionEditable = {};
        for (const proyecto of this.assignedProjects) {
          const ultima = this.latestCalificacion(proyecto);
          const estadoPorDefecto = ultima?.estado_id ?? (this.estados[0]?.id ?? "");
          const evidenciaPrincipal = (this.evidenciasByProyecto[proyecto.codigo] || [])[0] || null;
          form[proyecto.codigo] = {
            evidencia_id: evidenciaPrincipal?.id || "",
            nota: ultima?.nota ?? "",
            estado_id: estadoPorDefecto,
            observaciones: ultima?.observaciones ?? ""
          };
          submitting[proyecto.codigo] = false;
          observacionEditable[proyecto.codigo] = false;
        }
        this.calificacionesForm = form;
        this.submitting = submitting;
        this.observacionEditable = observacionEditable;
      } finally {
        this.loading = false;
      }
    },
    async calificar(proyecto) {
      const payload = { ...this.calificacionesForm[proyecto.codigo] };
      if (!payload.evidencia_id || payload.nota === "" || !payload.estado_id) {
        alert("Completa todos los campos obligatorios para calificar.");
        return;
      }
      this.submitting[proyecto.codigo] = true;
      try {
        await client.calificaciones.create({
          evidencia_id: Number(payload.evidencia_id),
          profesor_id: Number(this.profesor?.usuario_id),
          nota: Number(payload.nota),
          estado_id: Number(payload.estado_id),
          observaciones: payload.observaciones || null
        });
        alert("Calificación guardada.");
        this.observacionEditable[proyecto.codigo] = false;
        await this.loadData();
      } catch (error) {
        alert(error?.data?.detail || error?.message || "Error guardando calificación");
      } finally {
        this.submitting[proyecto.codigo] = false;
      }
    },
    estadoNombre(estadoId) {
      const found = this.estados.find((estado) => Number(estado.id) === Number(estadoId));
      return found ? found.nombre : estadoId;
    },
    toggleObservacionEdit(proyecto) {
      const key = proyecto.codigo;
      this.observacionEditable[key] = !this.observacionEditable[key];
    },
    primaryAutor(proyecto) {
      const autores = this.autoresByProyecto[proyecto.codigo] || [];
      return autores[0] || null;
    },
    latestCalificacion(proyecto) {
      const list = this.calificacionesByProyecto[proyecto.codigo] || [];
      if (!list.length) return null;
      return list.slice().sort((a, b) => Number(b.id) - Number(a.id))[0];
    },
    primaryEvidencia(proyecto) {
      const list = this.evidenciasByProyecto[proyecto.codigo] || [];
      return list[0] || null;
    },
    rolNombre(rolId) {
      const roles = {
        1: "ESTUDIANTE",
        2: "PROFESOR",
        3: "ADMIN",
        4: "SUPERADMIN"
      };
      return roles[rolId] || rolId || "-";
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
.docente-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.docente-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef1f4;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.docente-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.docente-card__title {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 15px;
}

.docente-card__right {
  font-size: 12px;
  color: #0f172a;
  white-space: nowrap;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 999px;
}

.docente-card__id {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.docente-card__body {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 14px;
}

.docente-card__left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  align-self: stretch;
}

.docente-card__avatar {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.docente-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.docente-card__meta {
  text-align: center;
}

.docente-card__main {
  display: grid;
  gap: 10px;
}

.docente-card__line {
  font-size: 12px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.docente-card__label-inline {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  min-width: 72px;
}

.docente-card__section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid #eef1f4;
}

.docente-card__section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}

.docente-card__observacion-input {
  resize: vertical;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-height: 80px;
}

.docente-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}

.docente-card__footer-left {
  font-size: 11px;
  color: #64748b;
  display: grid;
  gap: 4px;
}

.docente-card__footer-right {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.docente-card__nota-input {
  max-width: 90px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  height: 36px;
}

.docente-card__guardar {
  min-width: 80px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  height: 36px;
}

.docente-card--compact h4 {
  font-size: 18px;
}

.docente-card--compact .form-label {
  font-size: 12px;
  margin-bottom: 4px;
}

.docente-card--compact .form-control,
.docente-card--compact .form-select,
.docente-card--compact textarea {
  padding: 6px 10px;
  font-size: 13px;
}

.docente-card--compact .btn {
  padding: 6px 12px;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .docente-card__body {
    grid-template-columns: 1fr;
  }

  .docente-card__left {
    flex-direction: row;
    justify-content: flex-start;
  }

  .docente-card__meta {
    text-align: left;
  }
}
</style>
