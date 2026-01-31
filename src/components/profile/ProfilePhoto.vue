<script setup>
import {ref, watch} from 'vue'

const props = defineProps({
    photo: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update-photo'])

const preview = ref(props.photo)

watch(() => props.photo, (newVal) => {
    preview.value = newVal
})

const onFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    preview.value = URL.createObjectURL(file)
    emit('update-photo', file)
}

</script>

<template>
    <div class="text-center">

        <img 
          :src="preview || 'https://via.placeholder.com/150'" 
          class="rounded-circle mb-2"
          width="150"
          />
  
          <input 
          type="file"
          accept="image/*"
          class="form-control"
          @change="onFileChange"
          />
    </div>
</template>