<template>
  <div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Programas Académicos</h2>

      <button class="btn btn-primary" @click="toggleForm">
        {{ showForm ? "Cerrar" : "Nuevo programa" }}
      </button>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="showForm" class="card p-3 mb-4 shadow-sm">

      <h5 class="mb-3">
        {{ editingId ? "Editar" : "Nuevo" }} Programa
      </h5>

      <form @submit.prevent="onSubmit">

        <div class="row g-3">

          <div class="col-md-8">
            <input
              v-model="form.nombre"
              class="form-control"
              placeholder="Nombre del programa"
              required
            />
          </div>

          <div class="col-md-4">
            <div class="form-check form-switch mt-2">
              <input
                v-model="form.activo"
                class="form-check-input"
                type="checkbox"
                id="activo"
              />
              <label class="form-check-label" for="activo">
                Activo
              </label>
            </div>
          </div>

        </div>

        <div class="mt-3 text-end">
          <button class="btn btn-success" type="submit">
            Guardar
          </button>
        </div>

      </form>
    </div>

    <div class="card shadow-sm">

      <div v-if="loading" class="p-3 text-muted">
        Cargando programas...
      </div>

      <table v-else class="table table-hover mb-0">

        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th class="text-center">Activo</th>
            <th width="120">Editar</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="(p, i) in items" :key="p.id">

            <td>{{ i + 1 }}</td>

            <td>{{ p.nombre }}</td>

            <td class="text-center">

              <div class="form-check form-switch d-inline-block">

                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="p.activo"
                  @change="toggleActivo(p)"
                  style="cursor:pointer;"
                />

              </div>

            </td>

            <td>

              <button
                class="btn btn-sm btn-warning"
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

  name: "ProgramasView",

  data() {
    return {
      items: [],
      loading: true,
      error: "",
      showForm: false,
      editingId: null,
      form: {
        nombre: "",
        activo: true
      }
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

        const { items } = await client.programas.list();
        this.items = items;

      } catch {

        this.error = "Error cargando programas";

      } finally {

        this.loading = false;
      }
    },

    toggleForm() {

      this.showForm = !this.showForm;

      if (!this.showForm) {
        this.resetForm();
      }
    },

    resetForm() {

      this.editingId = null;

      this.form = {
        nombre: "",
        activo: true
      };
    },

    edit(p) {

      this.showForm = true;
      this.editingId = p.id;

      this.form.nombre = p.nombre;
      this.form.activo = p.activo;
    },

    async onSubmit() {

      this.error = "";

      const payload = { ...this.form };

      try {

        if (!this.editingId) {

          await client.programas.create(payload);

        } else {

          await client.programas.update(
            this.editingId,
            payload
          );
        }

        await this.load();
        this.toggleForm();

      } catch (e) {

        this.error =
          e?.data?.detail ||
          "Error guardando programa";
      }
    },

    async toggleActivo(p) {

      const nuevo = !p.activo;

      try {

        await client.programas.update(p.id, {
          activo: nuevo
        });

        p.activo = nuevo;

      } catch {

        alert("No se pudo cambiar estado");
      }
    }

  }
};
</script>

<style scoped>
.table td {
  vertical-align: middle;
}

.form-switch .form-check-input {
  cursor: pointer;
}
</style>
