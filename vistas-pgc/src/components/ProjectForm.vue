<template>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0">registro de proyectos</h3>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="$emit('close')">
          cerrar formulario
        </button>
      </div>

      <form class="form" @submit.prevent="$emit('submit')">
        <div class="row g-3 form-section">
          <div class="col-md-6">
            <label class="form-label">Titulo</label>
            <input type="text" class="form-control" :value="title" @input="$emit('update:title', $event.target.value)">
          </div>

          <div class="col-md-6">
            <label class="form-label">Semestre</label>
            <select class="form-select" :value="academicLevel" @change="$emit('update:academic-level', $event.target.value ? Number($event.target.value) : null)">
              <option :value="null"></option>
              <option v-for="semester in academicLevels" :key="semester" :value="semester">
                {{ semester }}
              </option>
            </select>
          </div>
        </div>

        <div class="d-flex flex-column gap-2 form-section">
          <label class="form-label mb-1">Autores</label>

          <div class="d-flex align-items-center gap-2">
            <span class="author-index">1</span>
            <input
              type="text"
              class="form-control author-input"
              :value="authors[0]"
              @input="updateAuthor(0, $event.target.value)"
            >
            <button
              v-if="authors.length < 2"
              type="button"
              class="btn btn-outline-primary author-action-btn"
              @click="$emit('add-author')"
            >
              añadir
            </button>
            <span v-else class="author-action-placeholder" aria-hidden="true"></span>
          </div>

          <div class="d-flex align-items-center gap-2" v-if="authors.length === 2">
            <span class="author-index">2</span>
            <input
              type="text"
              class="form-control author-input"
              :value="authors[1]"
              @input="updateAuthor(1, $event.target.value)"
            >
            <button
              type="button"
              class="btn btn-outline-danger author-action-btn"
              @click="$emit('remove-author', 1)"
            >
              eliminar
            </button>
          </div>
        </div>

        <div class="cold-md-4 form-section">
          <label class="form-label">Carrera</label>
          <select class="form-select" :value="career" @change="$emit('update:career', $event.target.value || null)">
            <option :value="null"></option>
            <option v-for="select_Carrer in optionsPrograms" :key="select_Carrer" :value="select_Carrer">
              {{ select_Carrer }}
            </option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">Temas</label>
          <multiselect
            :options="availableTopics"
            :model-value="selectedTopics"
            @update:modelValue="$emit('update:selected-topics', $event)"
            mode="tags"
            placeholder="Seleccione"
          />
        </div>

        <div class="form-section">
          <label class="form-label">Programas Relacionados</label>
          <multiselect
            :options="relatedPrograms"
            :model-value="selectedPrograms"
            @update:modelValue="$emit('update:selected-programs', $event)"
            mode="tags"
            placeholder="seleccione"
          />
        </div>

        <div class="d-flex justify-content-end form-section">
          <button type="submit" class="btn btn-primary px-4">
            guardar proyecto
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Multiselect from "@vueform/multiselect"
import "@vueform/multiselect/themes/default.css"

const props = defineProps({
  title: { type: String, default: "" },
  academicLevels: { type: Array, default: () => [] },
  academicLevel: { type: Number, default: null },
  authors: { type: Array, default: () => [""] },
  career: { type: String, default: null },
  optionsPrograms: { type: Array, default: () => [] },
  availableTopics: { type: Array, default: () => [] },
  selectedTopics: { type: Array, default: () => [] },
  relatedPrograms: { type: Array, default: () => [] },
  selectedPrograms: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:title',
  'update:academic-level',
  'update:authors',
  'update:career',
  'update:selected-topics',
  'update:selected-programs',
  'submit',
  'close',
  'add-author',
  'remove-author'
])

const updateAuthor = (index, value) => {
  const next = [...props.authors]
  next[index] = value
  emit('update:authors', next)
}
</script>
