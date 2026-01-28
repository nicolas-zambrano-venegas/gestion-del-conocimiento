<script>
// no lo borres bro, con este ando modificando y estructurando 


import Multiselect from "@vueform/multiselect"
import "@vueform/multiselect/themes/default.css"

import topics from "../../../data/topics.js"
import universityprograms from "../../../data/university_programs.js"

export default{
    components: {Multiselect},
    
    data() {

        return {

            showform: false,
            projects: [],

            title:"",
            academic_levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            academic_level: null,

            Number_Authors: 1,
            Authors: {
                Author_1:"",
                Author_2:""
            },

            Career: null,
            Options_Programs: universityprograms,


            Selected_Topics: [],
            Available_Topics: topics,

            Selected_Programs: [],
            Related_Programs: universityprograms,

            editingindex: null
        }
    },

    methods: {
        submitform() {

            if (!this.title.trim()) {
                alert("Debe colocar un titulo")
                return
            }

            if (this.academic_level === null) {
                alert("Seleccione el semestre al que pertenece")
                return
            }

            if (this.Career === null) {
                alert("Seleccione la carrera a la que pertenece")
                return
            }


            const authors = [this.Authors.Author_1]
            if (this.Number_Authors === 2 && this.Authors.Author_2) {
                authors.push(this.Authors.Author_2)
            }

            // valores actuales 
            const ProjectData = {
                title: this.title,
                academic_level: this.academic_level,
                Authors: authors,
                Career: this.Career,
                topics: this.Selected_Topics,
                programs: this.Selected_Programs
            }


            // editar y crear
            if (this.editingindex !== null) {
                this.projects[this.editingindex] = ProjectData
                this.editingindex = null
            }else {
                this.projects.push(ProjectData)
            }

    
            this.title = ""
            this.academic_level = null
            this.Authors.Author_1 = ""
            this.Authors.Author_2 = ""
            this.Number_Authors = 1
            this.Career = null
            this.Selected_Topics = []
            this.Selected_Programs = []
            this.showform = false

        },

        DeleteProject(index) {
            if (confirm("¿seguro que desea eliminar el proyecto?"))
            this.projects.splice(index, 1)
        },

        EditProject(project, index) {
            this.editingindex = index
            
            this.title = project.title
            this.academic_level = project.academic_level
            this.Career = project.Career
            this.Selected_Topics =[...project.topics]
            this.Selected_Programs = [...project.programs]

            this.Authors.Author_1 = project.Authors[0] || ""
            this.Authors.Author_2 = project.Authors[1] || ""
            this.Number_Authors = project.Authors.length

            this.showform = true
        }
    }
}

</script>

<template>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
            REPOSITORIO DE PROYECTOS
        </h2>

        <button class="btn btn-success" @click="showform = true">
            Agregar proyecto
        </button>
    </div>

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
                <td>{{ project.academic_level}}</td>
                <td>{{ project.Authors.join(", ") }}</td>
                <td>{{ project.Career }}</td>
                <td>{{ project.topics.join(", ") }}</td>
                <td>{{ project.programs.join(", ") }}</td>
                <td class="d-flex gap-2">
                    <button class="btn btn-sm btn-warning"
                    @click="EditProject(project, index)">
                        <img src="/edit.png" width="18">
                    </button>

                    <button class="btn btn-sm btn-danger"
                    @click="DeleteProject(index)">
                        <img src="/bin.png" width="18">
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-11 col-xl-10">
                
                <div v-if="showform">
                    
                    <div class="card shadow-sm">
                        <div class="card-body p-4">
        
                            <h3 class="mb-4">registro de proyectos</h3>
                            
                                    <form class="form" @submit.prevent="submitform()">
        
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Titulo</label>
                                                <input type="text" class="form-control" v-model="title">   
                                            </div>
        
                                            <div class="col-md-6">
                                                <label class="form-label">Semestre</label>
                                                <select class="form-select" v-model="academic_level">
                                                    <option :value="null"></option>

                                                    <option 
                                                    v-for="semester in academic_levels" 
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
                                    
                                                <select class="form-select" v-model="Number_Authors">
                                                    <option :value="1">1 Autor</option>
                                                    <option :value="2">2 Autores</option>
                                                </select>
        
                                            </div>
                                            
                                            <div class="col-md-4">
                                                <label class="form-label">Autor 1</label>
                                                <input type="text" class="form-control" v-model="Authors.Author_1">
                                            </div>
        
                                            <div class="col-md-4" v-if="Number_Authors === 2">
                                                <label class="form-label">Autor 2</label>
                                                <input type="text" class="form-control" v-model="Authors.Author_2">
                                            </div>
                                        </div>

                                        <div class="cold-md-4">
                                            <label class="form-label">Carrera</label>
                                            <select class="form-select" v-model="Career" >
                                                <option :value="null"></option>

                                                <option v-for="select_Carrer in Options_Programs"
                                                :key="select_Carrer"
                                                :value="select_Carrer"
                                                >
                                                {{ select_Carrer }}    
                                                </option>
                                            </select>

                                        </div>
        
                                        <hr class="my-4">
        
                                        <div class="mb-4">
                                            <label class="form-label">Temas</label>
                                            <multiselect
                                            :options="Available_Topics"
                                            v-model="Selected_Topics"
                                            mode="tags"
                                            placeholder="Seleccione"/>
                                        </div>
                            
                                        <div class="mb-4">
                                            <label class="form-label">Programas Relacionados</label>
                                            <multiselect
                                            :options="Related_Programs"
                                            v-model="Selected_Programs"
                                            mode="tags"
                                            placeholder="seleccione"/>
                                        </div>
        
                                        <div class="d-flex justify-content-end mt-4">
                                            <button type="submit" class="btn btn-primary px-4">
                                                guardar proyecto
                                            </button>
                                        </div>
                                    </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

<!-- terminar de hacer validaciones para los campos de: autores, carrera, 
 mejorar el estilo de las vistas,
 añadir un boton de cerrar formulario
  -->
</template>

<style>
.multiselect {
  --ms-border-radius: 0.375rem;
  --ms-border-color: #ced4da;
}
</style>