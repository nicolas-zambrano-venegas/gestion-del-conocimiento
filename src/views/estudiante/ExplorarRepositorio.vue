<template>
  <div class="container mt-5">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Explorar Repositorios</h2>

      <button class="btn btn-outline-secondary"
              @click="$router.push('/estudiante')">
        Volver
      </button>
    </div>

    <!-- Filtros -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <input
          v-model="filters.search"
          type="text"
          class="form-control"
          placeholder="Buscar por título"
        />
      </div>

      <div class="col-md-4">
        <select v-model="filters.career" class="form-select">
          <option value="">Todas las carreras</option>
          <option v-for="carrera in careers" :key="carrera" :value="carrera">
            {{ carrera }}
          </option>
        </select>
      </div>

      <div class="col-md-4">
        <select v-model="filters.topic" class="form-select">
          <option value="">Todos los temas</option>
          <option v-for="temas in topics" :key="temas" :value="temas">
            {{ temas }}
          </option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <ProjectsTable
      :projects="filteredProjects"
      :showActions="false"
      :showView="true"
      @view="verProyecto"
    />

    <!-- Cargando -->
    <div v-if="loading" class="text-center text-muted mt-3">
      Cargando proyectos...
    </div>

  </div>
</template>

<script>
import ProjectsTable from "../../components/ProjectsTable.vue";
import client from "../../sdk";

export default {
  name: "ExplorarRepositorio",

  components: {
    ProjectsTable
  },

  data() {
    return {
      projects: [],
      loading: true,

      filters: {
        search: "",
        career: "",
        level: ""
      }
    };
  },

  async mounted() {
    try {
      // 🔹 Backend real
      this.projects = await client.proyectos.listar();
    } catch (e) {
      console.error("Error cargando proyectos", e);
    } finally {
      this.loading = false;
    }
  },

  computed: {
    careers() {
      return [...new Set(this.projects.map(p => p.Career))];
    },

    topics() {
      return [...new Set(this.projects.flatMap(p => p.topics))];
    },

    filteredProjects() {
      return this.projects.filter(p => {
        const byTitle =
          p.title.toLowerCase().includes(this.filters.title.toLowerCase());

        const byCareer =
          !this.filters.career || p.Career === this.filters.career;

        const byTopic =
          !this.filters.topic || p.topics.includes(this.filters.topic);

        return byTitle && byCareer && byTopic;
      });
    }
  },

  methods: {
    verProyecto(project) {
      this.$router.push({
        name: "DetalleProyecto",
        params: { id: project.id }
      });
    }
  }
};
</script>

<!-- 
<script>
import ProjectsTable from "../../components/ProjectsTable.vue";
import client from "../../sdk";

export default {
  name: "EstudianteDashboard",
  data() {
    return {
      proyecto: null,
      loading: true
    };
  },
  async mounted() {
    try {
      const estudiante = await client.estudiante;
      if (estudiante) {
        this.proyecto = await estudiante.proyecto;
      }
    } finally {
      this.loading = false;
    }
  },
  methods: {

    verProyecto(project) {
      this.$router.push({
        name: "DetalleProyecto",
        params: {id: project.id}
      })
    },
    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);
      this.$router.push("/");
    },
    irAExplorar() {
      this.$router.push('/explorar');
    }
  }
};
</script> -->

<style scoped>
.dashboard-card {
  cursor: pointer;
  transition: all 0.25s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  background: #f8f9fa;
}
</style>
