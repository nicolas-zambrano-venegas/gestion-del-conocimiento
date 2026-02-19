<template>
  <div class="container mt-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Gestión de Roles</h3>
  
      <div class ="d-flex gap-2">

        <button
          class="btn btn-primary"
          @click="abrirModal()"
        >
        Nuevo Rol
        </button>
        <button class="btn btn-primary" @click="$router.back()">
          volver
        </button>
      </div>
    </div>
   

    <!-- Tabla -->
    <div class="card shadow-sm">

      <div v-if="loading" class="p-3 text-muted">
        Cargando roles...
      </div>

      <div v-else>

        <table
          v-if="roles.length"
          class="table table-striped mb-0"
        >
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th width="120">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in roles" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.nombre }}</td>

              <td>
                <button
                  class="btn btn-sm btn-warning"
                  @click="abrirModal(r)"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-else
          class="p-3 text-muted text-center"
        >
          No hay roles registrados
        </div>

      </div>
    </div>


    <!-- Modal -->
    <div
      class="modal fade"
      id="modalRol"
      tabindex="-1"
    >
      <div class="modal-dialog">

        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">
              {{ editando ? "Editar Rol" : "Nuevo Rol" }}
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body">

            <div class="mb-3">
              <label class="form-label">Nombre</label>

              <input
                v-model="form.nombre"
                type="text"
                class="form-control"
              >
            </div>

          </div>

          <div class="modal-footer">

            <button
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>

            <button
              class="btn btn-primary"
              @click="guardar"
            >
              Guardar
            </button>

          </div>

        </div>

      </div>
    </div>

  </div>
</template>


<script>
import client from "../../sdk";
import * as bootstrap from "bootstrap";

export default {
  name: "RolesView",

  data() {
    return {
      roles: [],
      loading: true,

      editando: false,

      form: {
        id: null,
        nombre: ""
      },

      modal: null
    };
  },

  mounted() {
    this.cargarRoles();

    this.modal = new bootstrap.Modal(
      document.getElementById("modalRol")
    );
  },

  methods: {

    async cargarRoles() {
      try {
        this.loading = true;

        const { items } = await client.roles.list();

        this.roles = items;

      } catch (e) {
        console.error(e);
        alert("Error cargando roles");
      } finally {
        this.loading = false;
      }
    },


    abrirModal(rol = null) {

      if (rol) {
        this.editando = true;

        this.form = { ...rol };
      } else {
        this.editando = false;

        this.form = {
          id: null,
          nombre: ""
        };
      }

      this.modal.show();
    },


    async guardar() {

      if (!this.form.nombre.trim()) {
        return alert("Ingrese el nombre");
      }

      try {

        if (this.editando) {

          await client.roles.update(
            this.form.id,
            { nombre: this.form.nombre }
          );

        } else {

          await client.roles.create({
            nombre: this.form.nombre
          });

        }

        this.modal.hide();

        await this.cargarRoles();

      } catch (e) {
        console.error(e);
        alert("Error guardando rol");
      }

    }

  }
};
</script>
