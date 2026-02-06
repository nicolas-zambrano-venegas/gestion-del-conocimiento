<script setup>
import ProfilePhoto from './ProfilePhoto.vue';


defineProps({
    user: {
        type: Object,
        required: true
    },

    editable: Boolean 
})
</script>

<template>
    <div class="container-lg mt-4">
        <div class="row gx-5">

            <div class="col-md-3 ps-4">
                <div class="position-sticky" style="top: 80px;">
                    <div class="text-center">

                        <ProfilePhoto :photo="user.photo"  />
    
                        <h4 class="mt-3 mb-0">{{ user.name}}</h4>
                        <small class="text-muted d-block">{{ user.rol }}</small>
    
                        <div class="mt-2">
                            <span class="badge bg-success">{{ user.program }}</span>
                        </div>
                        
                        <button 
                        v-if="editable"
                        class="btn btn-outline-secondary w-100 mt-3"
                        >
                        Editar perfil
                        </button>
                    </div>
                    
                </div>
            </div>

            <div class="col-md-9 pe-4">
                contenido especifico por rol en el slot 
                <slot>  
                </slot>
            </div>
        </div>
    </div>
</template>