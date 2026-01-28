import { ref } from "vue"

export const useProjectForm = () => {
  const showForm = ref(false)
  const projects = ref([])

  const title = ref("")
  const academicLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const academicLevel = ref(null)

  const authors = ref([""])
  const career = ref(null)

  const selectedTopics = ref([])
  const selectedPrograms = ref([])

  const editingIndex = ref(null)

  const resetForm = () => {
    title.value = ""
    academicLevel.value = null
    authors.value = [""]
    career.value = null
    selectedTopics.value = []
    selectedPrograms.value = []
    showForm.value = false
    editingIndex.value = null
  }

  const submitForm = () => {
    if (!title.value.trim()) {
      alert("Debe colocar un titulo")
      return
    }

    if (academicLevel.value === null) {
      alert("Seleccione el semestre al que pertenece")
      return
    }

    if (career.value === null) {
      alert("Seleccione la carrera a la que pertenece")
      return
    }

    if (!authors.value[0].trim()) {
      alert("Debe colocar al menos un autor")
      return
    }

    if (authors.value.length === 2 && !authors.value[1].trim()) {
      alert("Debe completar el segundo autor")
      return
    }

    const normalizedAuthors = authors.value.map(author => author.trim()).filter(Boolean)

    const projectData = {
      title: title.value,
      academic_level: academicLevel.value,
      Authors: normalizedAuthors,
      Career: career.value,
      topics: selectedTopics.value,
      programs: selectedPrograms.value
    }

    if (editingIndex.value !== null) {
      projects.value[editingIndex.value] = projectData
    } else {
      projects.value.push(projectData)
    }

    resetForm()
  }

  const deleteProject = (index) => {
    if (confirm("¿seguro que desea eliminar el proyecto?")) {
      projects.value.splice(index, 1)
    }
  }

  const editProject = (project, index) => {
    editingIndex.value = index

    title.value = project.title
    academicLevel.value = project.academic_level
    career.value = project.Career
    selectedTopics.value = [...project.topics]
    selectedPrograms.value = [...project.programs]

    authors.value = [project.Authors[0] || ""]
    if (project.Authors[1]) {
      authors.value.push(project.Authors[1])
    }

    showForm.value = true
  }

  const addAuthorField = () => {
    if (authors.value.length < 2) {
      authors.value.push("")
    }
  }

  const removeAuthorField = (index) => {
    if (authors.value.length > 1) {
      authors.value.splice(index, 1)
    }
  }

  return {
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
  }
}
