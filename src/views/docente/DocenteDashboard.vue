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
/* ===== CONTENEDOR GENERAL ===== */
.docente-cards {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ===== TARJETA PRINCIPAL ===== */
.docente-card {
  background: linear-gradient(180deg, #ffffff, #f9fbff);
  border-radius: 18px;
  border: 1px solid #e5eaf2;
  padding: 16px;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.08);
  transition: all 0.25s ease;
}

.docente-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
}

/* ===== HEADER ===== */
.docente-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.docente-card__right {
  font-size: 12px;
  font-weight: 600;
  color: #1e3a8a;
  background: #e0e7ff;
  padding: 5px 14px;
  border-radius: 999px;
}

/* ===== CUERPO ===== */
.docente-card__body {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 18px;
}

/* ===== LADO IZQUIERDO ===== */
.docente-card__left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.docente-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f5f9;
  border: 3px solid #e0e7ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.docente-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.docente-card__meta {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #1f2933;
}

/* ===== CONTENIDO PRINCIPAL ===== */
.docente-card__main {
  display: grid;
  gap: 12px;
}

/* ===== SECCIONES ===== */
.docente-card__section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
}

.docente-card__section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
  margin-bottom: 6px;
}

/* ===== TITULO ===== */
.docente-card__title {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
  margin-bottom: 4px;
}

/* ===== LINEAS ===== */
.docente-card__line {
  font-size: 13px;
  color: #334155;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.docente-card__label-inline {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  min-width: 80px;
}

/* ===== TEXTAREA ===== */
.docente-card__observacion-input {
  resize: vertical;
  border-radius: 12px;
  border: 1px solid #cbd5f5;
  min-height: 90px;
  font-size: 13px;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.docente-card__observacion-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* ===== FOOTER ===== */
.docente-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed #cbd5f5;
}

.docente-card__footer-left {
  font-size: 12px;
  color: #64748b;
  display: grid;
  gap: 4px;
}

/* ===== PARTE DERECHA ===== */
.docente-card__footer-right {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

/* ===== INPUT NOTA ===== */
.docente-card__nota-input {
  max-width: 90px;
  border-radius: 12px;
  border: 1px solid #c7d2fe;
  height: 38px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
}

.docente-card__nota-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

/* ===== BOTON ===== */
.docente-card__guardar {
  min-width: 90px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  height: 38px;
  font-weight: 600;
  color: #fff;
  transition: all 0.2s ease;
}

.docente-card__guardar:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
  transform: scale(1.03);
}

.docente-card__guardar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ===== COMPACTO ===== */
.docente-card--compact h4 {
  font-size: 17px;
}

.docente-card--compact .form-label {
  font-size: 12px;
  margin-bottom: 4px;
}

.docente-card--compact .form-control,
.docente-card--compact .form-select,
.docente-card--compact textarea {
  padding: 7px 12px;
  font-size: 13px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .docente-card__body {
    grid-template-columns: 1fr;
  }

  .docente-card__left {
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
  }

  .docente-card__meta {
    text-align: left;
  }
}

@media (max-width: 576px) {
  .docente-card {
    padding: 12px;
  }

  .docente-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .docente-card__footer-right {
    justify-content: flex-end;
  }
}

</style>
