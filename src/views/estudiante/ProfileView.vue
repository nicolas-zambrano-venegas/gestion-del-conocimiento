<script setup>
import { ref, onMounted, computed } from 'vue';
import ProfileBase from '../../components/profile/ProfileBase.vue'
import client from '../../sdk'

const estudiante = ref(null)
const loading = ref(true)
const error = ref(null)

const user = computed(() => {
    if (!estudiante.value) return null
    return {
        name: `${estudiante.value.nombres || ''} ${estudiante.value.apellidos || ''}`.trim(),
        rol: "estudiante",
        program: estudiante.value.programa?.nombre || "No asignado",
        photo: estudiante.value.foto || null 
    }
})

onMounted(async () => {
    try {
        estudiante.value = await client.estudiante
        console.log("Estudiante cargado en ProfileView:", estudiante.value)
    } catch (e) {
        console.error("Error cargando perfil:", e)
        error.value = "No se pudo cargar la información del perfil"
    } finally {
        loading.value = false
    }
})

const onPhotoUpdate = (file) => {
    console.log('archivo recibido:', file)
}
</script>

<template>
    <div v-if="loading" class="text-center mt-5">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    </div>
    <div v-else-if="error" class="alert alert-danger mt-5">{{ error }}</div>
    <ProfileBase v-else :user="user" editable>
        <h5 class="mt-4"> mis proyectos</h5>
    </ProfileBase>
</template>

    <!-- <div class="container mt-4">
        <div class="row">
            <div class=" cold-md4 col-lg-3">

                <div class="card shadow-sm">
                    <div class="card-body text-center">
                
                        <ProfilePhoto
                            :photo="userPhoto"
                            @update-photo="onPhotoUpdate" 
                        />
                            
                        <hr>
        
                        <h4 class="fw-bold mb-0"> {{ name }}</h4>
                        <p class="text-muted mb-2">{{ rol }}</p>
                        
                        <span class="badge bg-success-subtle text-success">{{ program }}</span>
                    
                    </div>
                </div>
            </div>

            <div class="col-md-8 col-lg-9">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold">mis proyectos</h5>
                        <p class="text-muted">
                            se muestran mas adelante los proyectos del usuario
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div> -->
