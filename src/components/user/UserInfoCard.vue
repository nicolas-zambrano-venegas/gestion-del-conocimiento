<template>
  <div v-if="userData && !loading" class="card p-4 shadow-sm user-card">

    <div class="d-flex align-items-center gap-4">

      <!-- FOTO -->
      <div class="position-relative">
        <img
          :src="fotoFinal"
          class="user-avatar"
          alt="Foto usuario"
        />

        <!-- Botón cambiar foto -->
        <label class="btn-change-photo">
          <img src="../../assets/icons/camara.svg" class="icon-svg" />

          <input
            type="file"
            hidden
            @change="subirFoto"
            accept="image/*"
          />
        </label>
      </div>

      <!-- INFO -->
      <div class="flex-grow-1">
        <h4 class="mb-1">{{ nombresCompletos }}</h4>

        <div class="text-muted">
          {{ userData.rol || userData.programa?.nombre || 'Estudiante' }}
        </div>

        <span
          class="badge mt-2"
          :class="userData.activo ? 'bg-success' : 'bg-secondary'"
        >
          {{ userData.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

    </div>
  </div>

  <div v-else class="text-center text-muted p-3">
    Cargando información del usuario...
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import client from '../../sdk'

const props = defineProps({
  user: Object
})

const loading = ref(false)

/* Datos del usuario */
const userData = computed(() => props.user)

/* Nombre completo */
const nombresCompletos = computed(() => {
  if (!userData.value) return ''
  return userData.value.nombre ||
         `${userData.value.nombres || ''} ${userData.value.apellidos || ''}`.trim()
})

/* FOTO FINAL */
const fotoFinal = computed(() => {
  if (!userData.value) return ''

  if (userData.value.foto) {
    return userData.value.foto.startsWith('data:')
      ? userData.value.foto
      : `data:image/png;base64,${userData.value.foto}`
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombresCompletos.value)}`
})

/* SUBIR FOTO */
const subirFoto = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = async () => {
    try {
      loading.value = true

      const base64 = reader.result

      await client.usuarios.update(userData.value.id, {
        foto: base64
      })

      userData.value.foto = base64

    } catch (error) {
      console.error("Error subiendo foto:", error)
      alert("No se pudo subir la foto")
    } finally {
      loading.value = false
    }
  }

  reader.readAsDataURL(file)
}
</script>

<style scoped>
.user-card {
  border-radius: 16px;
}

.user-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
}

/* Botón flotante */
.btn-change-photo {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #0d6efd;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.btn-change-photo:hover {
  background: #0b5ed7;
  transform: scale(1.1);
}

.icon-svg {
  width: 18px;
  height: 18px;
}
</style>
