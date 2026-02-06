<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '../../sdk'

const route = useRoute()
const proyectoId = Number(route.params.id)

const proyecto = ref(null)
const estudiantes = ref([])
const loading = ref(false)
const error = ref(null)

const cargarProyecto = async () => {
  loading.value = true
  error.value = null

  try {
    proyecto.value = await client.proyectos.get(proyectoId)
    estudiantes.value = await client.proyectos.estudiantes(proyectoId)

  } catch (err) {
    error.value =
      err?.response?.data?.detail ||
      err?.message ||
      'No tienes permiso para ver este proyecto'
  } finally {
    loading.value = false
  }
}

onMounted(cargarProyecto)
</script>


<template>
  <div class="container mt-4">

    <h3 class="mb-4">Detalle del Proyecto</h3>

    <div v-if="loading">
      Cargando proyecto...
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

   
    <div v-if="proyecto && !loading" class="card p-4 mb-4">
      <h4 class="mb-2">{{ proyecto.titulo }}</h4>

      <p><strong>Código:</strong> {{ proyecto.codigo }}</p>
      <p><strong>Nivel:</strong> {{ proyecto.nivel }}</p>
      <p><strong>Estado:</strong> {{ proyecto.estado_id }}</p>
      <p>
        <strong>Activo:</strong>
        <span v-if="proyecto.activo">Sí</span>
        <span v-else>No</span>
      </p>
    </div>

    <div v-if="estudiantes.length" class="card p-4">
      <h5 class="mb-3">Estudiantes del proyecto</h5>

      <ul class="list-group">
        <li
          v-for="estudiante in estudiantes"
          :key="estudiante.id"
          class="list-group-item"
        >
          {{ estudiante.nombres }} {{ estudiante.apellidos }}
        </li>
      </ul>
    </div>

  </div>
</template>
