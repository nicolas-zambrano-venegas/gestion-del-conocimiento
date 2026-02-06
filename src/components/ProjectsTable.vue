<template>
  <table class="table table-hover">
    <thead class="table-light">
      <tr>
        <th>Código</th>
        <th>Título</th>
        <th>Nivel</th>
        <th>Estado</th>
        <th v-if="showView">Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="projects.length === 0">
        <td :colspan="showView ? 5 : 4" class="text-center text-muted">
          No hay proyectos registrados
        </td>
      </tr>

      <tr v-for="project in projects" :key="project.codigo">
        <td>{{ project.codigo }}</td>
        <td>{{ project.titulo }}</td>
        <td>{{ project.nivel }}</td>
        <td>
          <span
            class="badge"
            :class="estadoClase(project.estado_id)"
          >
            {{ estadoTexto(project.estado_id) }}
          </span>
        </td>

        <td v-if="showView">
          <button
            class="btn btn-sm btn-primary"
            @click="$emit('view', project)"
          >
            Ver
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
  },
  showView: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view'])

const estadoTexto = (estadoId) => {
  const estados = {
    1: "Activo",
    2: "En revisión",
    3: "Rechazado",
    4: "Finalizado"
  }

  return estados[estadoId] || "Desconocido"
}

const estadoClase = (estadoId) => {
  const clases = {
    1: "bg-success",
    2: "bg-warning text-dark",
    3: "bg-danger",
    4: "bg-secondary"
  }

  return clases[estadoId] || "bg-dark"
}
</script>
