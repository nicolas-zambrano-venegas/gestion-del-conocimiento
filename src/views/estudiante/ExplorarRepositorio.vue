<template>
  <div class="container mt-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Explorar Repositorios</h2>
      <button class="btn btn-primary" @click="$router.back()">
        Volver
      </button>
    </div>

    <div class="mb-3">
      <input
        v-model="search"
        type="text"
        class="form-control"
        placeholder="Buscar proyecto por título..."
        @keyup.enter="cargarProyectos"
      />
    </div>

    <div v-if="loading" class="text-muted">
      Cargando proyectos...
    </div>

    <ProjectsTable
      v-else
      :projects="projects"
      :showView="true"
      @view="verProyecto"
    />

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
      search: "",
      page: 1,
      loading: false
    };
  },

  mounted() {
    this.cargarProyectos();
  },

  methods: {
    async cargarProyectos() {
      this.loading = true;
      try {
       const res = await client.proyectos.list({
        q: this.search || undefined,
        page: this.page
      });

      this.projects = res.items;


      } catch (error) {
        console.error("Error cargando proyectos:", error);

        if (error?.message === "Token expirado") {

          localStorage.removeItem("token");

          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },

    verProyecto(project) {
      this.$router.push({
        name: "DetalleProyecto",
        params: { id: project.codigo }
      });
    }
  }
};
</script>
