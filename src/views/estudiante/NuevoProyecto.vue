<template>
  <div class="container mt-5">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Crear nuevo proyecto</h2>
      <button class="btn btn-secondary" @click="$router.back()">
        Volver
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-warning text-center">
      {{ error }}
    </div>

    <!-- Formulario -->
    <form @submit.prevent="crearProyecto" class="card p-4 shadow">

      <!-- Título -->
      <div class="mb-3">
        <label class="form-label">Título del proyecto</label>
        <input
          v-model="form.titulo"
          class="form-control"
          required
        />
      </div>

      <!-- Nivel -->
      <div class="mb-3">
        <label class="form-label">Nivel / Semestre</label>
        <input
          v-model.number="form.nivel"
          type="number"
          class="form-control"
          required
        />
      </div>

      <!-- Programa -->
      <div class="mb-3">
        <label class="form-label">Programa</label>
        <select
          v-model.number="programaId"
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

      <!-- Temas -->
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

      <!-- Botón -->
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
      error: null,

      form: {
        titulo: "",
        nivel: null,
        estado_id: 2, 
      },

      programas: [],
      temas: [],
      programaId: null,
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
    async cargarProgramas() {
      const res = await client.programas.list();
      this.programas = res.items.filter(p => p.id !== 1);
    },

    async cargarTemas() {
      const res = await client.temas.list();
      this.temas = res.items;
    },

    async crearProyecto() {
      this.loading = true;
      this.error = null;

      if (!this.form.titulo || !this.form.nivel || !this.programaId) {
        this.error = "Debes completar todos los campos obligatorios";
        this.loading = false;
        return;
      }

      try {
        const proyecto = await client.proyectos.create(this.form);
        const proyectoId = proyecto.codigo;

        const estudiante = await client.estudiante;

        await client.proyectos.asignarEstudiante(
          proyectoId,
          estudiante.id
        );

        await client.proyectos.asignarPrograma(
          proyectoId,
          this.programaId
        );

        for (const temaId of this.temasSeleccionados) {
          await client.proyectos.asignarTema(
            proyectoId,
            temaId
          );
        }

        this.$router.push("/estudiante");

      } catch (err) {
        const mensaje = err?.message || "";

        if (mensaje.includes("ya tiene proyecto")) {
          this.error = "Ya tienes un proyecto asignado. No puedes crear otro.";
        } else {
          this.error =
            "Ocurrió un error al crear el proyecto. Intenta nuevamente.";
        }

      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

