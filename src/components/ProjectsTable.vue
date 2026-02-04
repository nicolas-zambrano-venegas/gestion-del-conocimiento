<template>
<!-- <template>
  <table class="table table-hover">
    <thead class="table-ligth">
      <tr>
        <th>Titulos</th>
        <th>Semestre</th>
        <th>Autores</th>
        <th>Carrera</th>
        <th>Temas</th>
        <th>programas Relacionados</th>
        <th>opciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="projects.length === 0">
        <td colspan="4" class="text-center text-muted">
          Sin proyectos registrados
        </td>
      </tr>

      <tr v-for="(project, index) in projects" :key="index">
        <td>{{ project.title }}</td>
        <td>{{ project.academic_level }}</td>
        <td>{{ project.Authors.join(", ") }}</td>
        <td>{{ project.Career }}</td>
        <td>{{ project.topics.join(", ") }}</td>
        <td>{{ project.programs.join(", ") }}</td>
        <td class="d-flex gap-2">
          <button class="btn btn-sm btn-warning" @click="$emit('edit', project, index)">
            <img src="/edit.png" width="18" />
          </button>

          <button class="btn btn-sm btn-danger" @click="$emit('delete', index)">
            <img src="/bin.png" width="18" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete'])
<template>
  <table class="table table-hover">
    <thead class="table-light">
      <tr>
        <th>Título</th>
        <th>Semestre</th>
        <th>Autores</th>
        <th>Carrera</th>
        <th>Temas</th>
        <th>Programas Relacionados</th>
        <th v-if="showActions || showView">Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="projects.length === 0">
        <td :colspan="showActions || showView ? 7 : 6" class="text-center text-muted">
          Sin proyectos registrados
        </td>
      </tr>

      <tr v-for="(project, index) in projects" :key="index">
        <td>{{ project.title }}</td>
        <td>{{ project.academic_level }}</td>
        <td>{{ project.Authors.join(", ") }}</td>
        <td>{{ project.Career }}</td>
        <td>{{ project.topics.join(", ") }}</td>
        <td>{{ project.programs.join(", ") }}</td>

        <td v-if="showActions || showView" class="d-flex gap-2">
          <!-- Ver (estudiante) -->
          <button
            v-if="showView"
            class="btn btn-sm btn-primary"
            @click="$emit('view', project)"
          >
            Ver
          </button>

          <!-- Editar / eliminar (admin / docente) -->
          <template v-if="showActions">
            <button
              class="btn btn-sm btn-warning"
              @click="$emit('edit', project, index)"
            >
              <img src="/edit.png" width="18" />
            </button>

            <button
              class="btn btn-sm btn-danger"
              @click="$emit('delete', index)"
            >
              <img src="/bin.png" width="18" />
            </button>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showView: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete', 'view'])
</script>
