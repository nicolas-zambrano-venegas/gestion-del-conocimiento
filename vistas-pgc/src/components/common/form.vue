<script setup>
import Multiselect from "@vueform/multiselect"
import "@vueform/multiselect/themes/default.css"

formFields({
    form: Object,
    academicLevels:Array,
    topics:Array,
    programs:Array,
    numberAuthors:Number
})

definedEmits(["save", "close"])
</script>

<template>

<div class="card shadow-sm">
    <div class="card-body p-4">

        <h3 class="mb-4">registro de proyectos</h3>
        
                <form class="form" @submit.prevent="submitform()">

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Titulo</label>
                            <input class="form-control" v-model="title">   
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Semestre</label>
                            <select class="form-select" v-model="form.academicLevel">
                                <option :value="null"></option>

                                <option 
                                v-for="semester in academicLevels" 
                                :key = semester 
                                :value="semester"
                                >
                                    {{ semester }}
                                </option>
                            </select>
                            
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="row g-3">
                        <div class="col-md-4">

                            <label class="form-label">Autores</label>
                
                            <select class="form-select" v-model="numberAuthors">
                                <option :value="1">1 Autor</option>
                                <option :value="2">2 Autores</option>
                            </select>

                        </div>
                        
                        <div class="col-md-4">
                            <label class="form-label">Autor 1</label>
                            <input class="form-control" v-model="form.Authors[0]">
                        </div>

                        <div class="col-md-4" v-if="numberAuthors === 2">
                            <label class="form-label">Autor 2</label>
                            <input class="form-control" v-model="form.Authors[1]">
                        </div>
                    </div>

                    <div class="cold-md-4">
                        <label class="form-label">Carrera</label>
                        <select class="form-select" v-model="form.Career" >
                            <option :value="null"></option>

                            <option v-for=" career in Programs"
                            :key="career"
                            :value="career"
                            >
                            {{ career }}    
                            </option>
                        </select>

                    </div>

                    <hr class="my-4">

                    <div class="mb-4">
                        <label class="form-label">Temas</label>
                        <multiselect
                        :options="topics"
                        v-model="form.topics"
                        mode="tags"
                        />
                    </div>
        
                    <div class="mb-4">
                        <label class="form-label">Programas Relacionados</label>
                        <multiselect
                        :options="programs"
                        v-model="form.programs"
                        mode="tags"
                        />
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <button type="submit" class="btn btn-secondary" @click="$emit('close')">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-outline-primary">
                            Guardar
                        </button>
                    
                    </div>
                </form>
    </div>
</div>
</template>
<!-- terminar de hacer validaciones para los campos de: autores, carrera, 
 mejorar el estilo de las vistas,
 añadir un boton de cerrar formulario
  -->