<template>
  <div class="card p-3 shadow-sm user-card">
    <div class="d-flex align-items-center gap-3">

      <img
        :src="fotoFinal"
        class="user-avatar"
        alt="Foto usuario"
      />

      <div class="flex-grow-1">
        <h5 class="mb-1">
          {{ user.nombres }} {{ user.apellidos }}
        </h5>

        <div class="text-muted small">
          {{ user.rol }}
        </div>
      </div>

      <span
        class="badge"
        :class="user.activo ? 'bg-success' : 'bg-secondary'"
      >
        {{ user.activo ? 'Activo' : 'Inactivo' }}
      </span>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const fotoFinal = computed(() => {
  return (
    props.user.foto ||
    'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(
        `${props.user.nombres} ${props.user.apellidos}`
      )
  )
})
</script>

<style scoped>
.user-card {
  border-radius: 14px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
