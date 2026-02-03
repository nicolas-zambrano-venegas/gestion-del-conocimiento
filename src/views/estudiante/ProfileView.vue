<script setup>
// import { ref } from 'vue';
import ProfileBase from '../../components/profile/ProfileBase.vue'


const user = {
    name: "nicolas zambrano",
    rol: "estudiante",
    program: "Ingenieria de Software",
    photo: null 
}

const onPhotoUpdate = (file) => {
    console.log('archivo recibido:', file)
}
</script>

<template>
    <ProfileBase :user="user" editable>
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
