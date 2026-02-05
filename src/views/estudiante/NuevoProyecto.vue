<template>
  <div class="container mt-5">
    <h2 class="mb-4">Crear nuevo proyecto</h2>

    <form @submit.prevent="crearProyecto" class="card p-4 shadow">

      <!-- TÍTULO -->
      <div class="mb-3">
        <label class="form-label">Título del proyecto</label>
        <input
          v-model="form.titulo"
          class="form-control"
          required
        />
      </div>

      <!-- NIVEL -->
      <div class="mb-3">
        <label class="form-label">Nivel / Semestre</label>
        <input
          v-model="form.nivel"
          class="form-control"
          required
        />
      </div>

      <!-- PROGRAMA -->
      <div class="mb-3">
        <label class="form-label">Programa</label>
        <select
          v-model="programaId"
          class="form-select"
          required
        >
          <option disabled value="">
            Seleccione un programa
          </option>

          <option
            v-for="p in programas"
            :key="p.id"
            :value="p.id"
          >
            {{ p.nombre }}
          </option>
        </select>
      </div>

      <!-- TEMAS -->
      <div class="mb-3">
        <label class="form-label">Temas</label>

        <div v-if="temas.length === 0" class="text-muted">
          No hay temas registrados
        </div>

        <div
          v-for="t in temas"
          :key="t.id"
          class="form-check"
        >
          <input
            class="form-check-input"
            type="checkbox"
            :value="t.id"
            v-model="temasSeleccionados"
          />
          <label class="form-check-label">
            {{ t.nombre }}
          </label>
        </div>
      </div>

      <button
        class="btn btn-primary"
        :disabled="loading || temasSeleccionados.length === 0"
      >
        {{ loading ? "Creando..." : "Crear proyecto" }}
      </button>
    </form>
  </div>
</template>

<script>
import client from "../../sdk";

export default {
  name: "NuevoProyecto",

  data() {
    return {
      loading: false,

      form: {
        titulo: "",
        nivel: "",
        estado_id: 1 // estado inicial (ej: En revisión)
      },

      programas: [],
      temas: [],
      programaId: "",
      temasSeleccionados: []
    };
  },

  async mounted() {
    try {
      const estudiante = await client.estudiante;

      if (estudiante?.proyecto) {
        this.$router.push("/estudiante");
        return;
      }

      await this.cargarProgramas();
      await this.cargarTemas();

    } catch (e) {
      console.error("Sesión expirada", e);
    }
  },

  methods: {
    // 📚 PROGRAMAS
    async cargarProgramas() {
      const res = await client.programas.list();

      // excluir "Sin programa" (id = 1)
      this.programas = res.filter(p => p.id !== 1);
    },

    // 🏷️ TEMAS
    async cargarTemas() {
      const res = await client.temas.list();
      this.temas = res;
    },

    // 🚀 CREAR PROYECTO
    async crearProyecto() {
      this.loading = true;

      try {
        // 1️⃣ crear proyecto
        const proyecto = await client.proyectos.create(this.form);
        const proyectoId = proyecto.codigo;

        // 2️⃣ asignar estudiante
        const estudiante = await client.estudiante;
        await client.proyectos.asignarEstudiante(
          proyectoId,
          estudiante.id
        );

        // 3️⃣ asignar programa
        await client.proyectos.asignarPrograma(
          proyectoId,
          this.programaId
        );

        // 4️⃣ asignar temas
        for (const temaId of this.temasSeleccionados) {
          await client.proyectos.asignarTema(
            proyectoId,
            temaId
          );
        }

        // 5️⃣ volver al dashboard
        this.$router.push("/estudiante");

      } catch (e) {
        console.error(e);
        alert("Error creando el proyecto");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

