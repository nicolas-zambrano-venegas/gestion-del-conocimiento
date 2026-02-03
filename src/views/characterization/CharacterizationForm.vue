<script setup>
// no lo borres bro, con este ando modificando y estructurando 

import { topics, universityPrograms } from "../../data/catalogs.js"
import ProjectsTable from "../../components/ProjectsTable.vue"
import ProjectForm from "../../components/ProjectForm.vue"
import { useProjectForm } from "../../composables/useProjectForm.js"
import "../../styles/characterization-form.css"

const {
  showForm,
  projects,
  title,
  academicLevels,
  academicLevel,
  authors,
  career,
  selectedTopics,
  selectedPrograms,
  submitForm,
  deleteProject,
  editProject,
  addAuthorField,
  removeAuthorField
} = useProjectForm()

const optionsPrograms = universityPrograms
const availableTopics = topics
const relatedPrograms = universityPrograms

const updateTitle = (value) => {
  title.value = value
}

const updateAcademicLevel = (value) => {
  academicLevel.value = value
}

const updateAuthors = (value) => {
  authors.value = value
}

const updateCareer = (value) => {
  career.value = value
}

const updateSelectedTopics = (value) => {
  selectedTopics.value = value
}

const updateSelectedPrograms = (value) => {
  selectedPrograms.value = value
}

const closeForm = () => {
  showForm.value = false
}
</script>

<template>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
            REPOSITORIO DE PROYECTOS
        </h2>

        <button class="btn btn-success" @click="showForm = true">
            Agregar proyecto
        </button>
    </div>

    <ProjectsTable
        :projects="projects"
        @edit="editProject"
        @delete="deleteProject"
    />

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-11 col-xl-10">
                
                <div v-if="showForm">
                    
                    <ProjectForm
                        :title="title"
                        :academic-level="academicLevel"
                        :academic-levels="academicLevels"
                        :authors="authors"
                        :career="career"
                        :options-programs="optionsPrograms"
                        :available-topics="availableTopics"
                        :selected-topics="selectedTopics"
                        :related-programs="relatedPrograms"
                        :selected-programs="selectedPrograms"
                        @update:title="updateTitle"
                        @update:academic-level="updateAcademicLevel"
                        @update:authors="updateAuthors"
                        @update:career="updateCareer"
                        @update:selected-topics="updateSelectedTopics"
                        @update:selected-programs="updateSelectedPrograms"
                        @add-author="addAuthorField"
                        @remove-author="removeAuthorField"
                        @close="closeForm"
                        @submit="submitForm"
                    />
                </div>
            </div>
        </div>
    </div>
</template>