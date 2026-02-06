<template>
  <!-- Solo renderiza si user ya tiene datos -->
  <div v-if="userData && !loading" class="card p-3 shadow-sm user-card">
    <div class="d-flex align-items-center gap-3">

      <!-- Foto del usuario o avatar automático -->
      <img
        :src="fotoFinal"
        class="user-avatar"
        alt="Foto usuario"
      />

      <div class="flex-grow-1">
        <!-- Nombre completo -->
        <h5 class="mb-1">{{ nombresCompletos }}</h5>

        <!-- Rol o programa académico -->
        <div class="text-muted small">
          {{ userData.rol || userData.programa?.nombre || 'Sin rol' }}
        </div>
      </div>

      <!-- Badge de estado -->
      <span
        class="badge"
        :class="userData.activo ? 'bg-success' : 'bg-secondary'"
      >
        {{ userData.activo ? 'Activo' : 'Inactivo' }}
      </span>

    </div>
  </div>

  <!-- Mensaje mientras se cargan los datos -->
  <div v-else class="text-center text-muted p-3">
    Cargando información del usuario...
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import client from '../../sdk'

const props = defineProps({
  user: {
    type: Object,
    required: false,
    default: null
  }
})

const estudiante = ref(null)
const loading = ref(true)

// Si se pasa user como prop, usarlo; si no, cargar del cliente
const userData = computed(() => {
  if (props.user) return props.user
  return estudiante.value
})

// Computed para nombre completo
const nombresCompletos = computed(() => {
  const user = userData.value
  if (!user) return ''
  if (user.nombre) return user.nombre
  return `${user.nombres || ''} ${user.apellidos || ''}`.trim()
})

// Computed para la foto
const fotoFinal = computed(() => {
  const user = userData.value
  if (!user) return ''
  return user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombresCompletos.value)}`
})

onMounted(async () => {
  // Solo cargar si no se pasó un user como prop
  if (!props.user) {
    try {
      estudiante.value = await client.estudiante
      // Si el SDK no devuelve estudiante, intentar tomar el primero de la colección (ambiente de prueba)
      if (!estudiante.value) {
        try {
          const res = await client.estudiantes.list()
          if (res && Array.isArray(res.items) && res.items.length) {
            estudiante.value = res.items[0]
          }
        } catch (inner) {
          console.warn('No se pudo recuperar lista de estudiantes:', inner)
        }
      }
    } catch (e) {
      console.error("Error cargando estudiante:", e)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.user-card {
  border-radius: 14px;
  background-color: #fff;
  transition: box-shadow 0.2s;
}

.user-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
