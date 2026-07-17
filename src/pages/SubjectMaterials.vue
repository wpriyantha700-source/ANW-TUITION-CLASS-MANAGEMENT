<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Subject Materials</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Manage and share learning resources with students
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="black"
          icon="upload_file"
          label="Upload New Material"
          rounded
          unelevated
          @click="showUploadDialog = true"
          class="q-px-lg shadow-2"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-select
          v-model="gradeFilter"
          :options="gradeOptions"
          label="Filter by Grade"
          outlined
          dense
          bg-color="white"
          clearable
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-select
          v-model="subjectFilter"
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          :options="filteredSubjectOptions"
          @filter="filterSubjectFn"
          new-value-mode="add-unique"
          label="Filter by Subject"
          outlined
          dense
          bg-color="white"
          clearable
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-input
          v-model="searchQuery"
          label="Search by Title"
          outlined
          dense
          bg-color="white"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Materials Grid -->
    <div v-if="filteredMaterials.length > 0" class="row q-col-gutter-md">
      <div
        v-for="material in filteredMaterials"
        :key="material.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          flat
          bordered
          class="rounded-borders hover-elevate cursor-pointer column full-height"
        >
          <q-card-section class="col-grow relative-position">
            <q-badge floating color="grey-2" text-color="grey-8">{{ material.type }}</q-badge>
            <div class="row items-center q-mb-sm">
              <q-avatar
                :color="getTypeColor(material.type)"
                text-color="white"
                icon="description"
                size="md"
              />
              <div class="q-ml-sm text-caption text-grey-6">{{ material.date }}</div>
            </div>
            <div
              class="text-subtitle1 text-weight-bold text-grey-9 ellipsis-2-lines q-mb-xs"
              style="min-height: 48px"
            >
              {{ material.title }}
            </div>
            <div class="text-caption text-grey-6">
              {{ material.subject }} • {{ material.grade }}
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">
              {{ material.size }} • {{ material.teacher }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="bg-grey-1">
            <div class="text-grey-6 text-caption q-mr-sm row items-center">
              <q-icon name="download" size="xs" class="q-mr-xs" /> {{ material.downloadCount }}
            </div>
            <q-space />
            <q-btn
              flat
              round
              color="primary"
              icon="download"
              size="sm"
              @click="downloadFile(material)"
            >
              <q-tooltip>Download</q-tooltip>
            </q-btn>
            <q-btn flat round color="red" icon="delete" size="sm" @click="confirmDelete(material)">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="folder_open" size="100px" color="grey-3" />
      <div class="text-h6 text-grey-5 q-mt-md">No materials found</div>
    </div>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUploadDialog">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-borders">
        <q-card-section class="bg-black text-white row items-center">
          <div class="text-h6">Upload New Material</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="handleUpload" class="q-gutter-md">
            <q-file
              v-model="newFile"
              label="Select File"
              outlined
              dense
              use-chips
              bg-color="white"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-input
              v-model="uploadForm.title"
              label="Document Title"
              outlined
              dense
              :rules="[(val) => !!val || 'Title is required']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select
                  v-model="uploadForm.grade"
                  :options="gradeOptions"
                  label="Target Grade"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="uploadForm.subject"
                  use-input
                  input-debounce="0"
                  :options="filteredSubjectOptions"
                  @filter="filterSubjectFn"
                  @input-value="(val) => (uploadSubjectInput = val)"
                  new-value-mode="add-unique"
                  label="Subject"
                  outlined
                  dense
                  hint="Type any subject & press Enter"
                  :rules="[(val) => !!val || !!uploadSubjectInput || 'Required']"
                />
              </div>
            </div>

            <q-input
              v-model="uploadForm.teacher"
              label="Uploaded By (Teacher Name)"
              outlined
              dense
            />

            <div class="row justify-end q-mt-lg">
              <q-btn label="Cancel" flat color="grey-8" v-close-popup class="q-mr-sm" />
              <q-btn
                label="Upload Material"
                color="black"
                unelevated
                type="submit"
                rounded
                :loading="uploading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMaterialStore } from 'src/stores/materialStore'

const $q = useQuasar()
const materialStore = useMaterialStore()

onMounted(() => {
  materialStore.fetchMaterials()
})

const showUploadDialog = ref(false)
const uploading = ref(false)
const newFile = ref(null)

// Filters
const gradeFilter = ref(null)
const subjectFilter = ref(null)
const searchQuery = ref('')

const gradeOptions = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'A/L Year 1',
  'A/L Year 2',
]
const subjectOptions = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'ICT',
  'Sinhala',
  'Physics',
  'Chemistry',
  'Biology',
]
const filteredSubjectOptions = ref(subjectOptions)
const uploadSubjectInput = ref('')

const filterSubjectFn = (val, update) => {
  if (val === '') {
    update(() => {
      filteredSubjectOptions.value = subjectOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredSubjectOptions.value = subjectOptions.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const uploadForm = reactive({
  title: '',
  grade: null,
  subject: null,
  teacher: 'Admin User',
})

const filteredMaterials = computed(() => {
  return materialStore.materials.filter((m) => {
    const matchesGrade = !gradeFilter.value || m.grade === gradeFilter.value
    const matchesSubject = !subjectFilter.value || m.subject === subjectFilter.value
    const matchesSearch =
      !searchQuery.value || m.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesGrade && matchesSubject && matchesSearch
  })
})

const getTypeColor = (type) => {
  const map = {
    PDF: 'red-5',
    DOCX: 'blue-5',
    PPT: 'orange-5',
    XLS: 'green-5',
  }
  return map[type] || 'grey-5'
}

const handleUpload = async () => {
  if (!newFile.value) {
    $q.notify({ type: 'negative', message: 'Please select a file' })
    return
  }

  uploading.value = true

  try {
    const extension = newFile.value.name.split('.').pop().toUpperCase()
    const size = (newFile.value.size / 1024 / 1024).toFixed(1) + ' MB'
    const finalSubject = uploadForm.subject || uploadSubjectInput.value

    await materialStore.addMaterial({
      title: uploadForm.title,
      subject: finalSubject,
      grade: uploadForm.grade,
      teacher: uploadForm.teacher,
      type: extension,
      size: size,
      file: newFile.value, // Pass the actual File object
    })

    $q.notify({ type: 'positive', message: 'Material uploaded successfully' })
    showUploadDialog.value = false

    // Reset form
    newFile.value = null
    uploadForm.title = ''
    uploadForm.grade = null
    uploadForm.subject = null
    uploadSubjectInput.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Upload failed',
    })
  } finally {
    uploading.value = false
  }
}

const downloadFile = (material) => {
  if (material.fileUrl) {
    const link = document.createElement('a')
    link.href = material.fileUrl
    link.download = material.fileName || `${material.title}.${material.type.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Increase download count locally
    material.downloadCount++

    $q.notify({
      type: 'positive',
      message: `Downloading ${material.title}...`,
      icon: 'file_download',
      timeout: 2000,
    })
  } else {
    // For sample data that doesn't have a real file
    $q.notify({
      type: 'warning',
      message: 'This is sample data. Real download is only available for newly uploaded files.',
      icon: 'info',
    })
  }
}

const confirmDelete = (material) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${material.title}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Delete', color: 'red', flat: true },
  }).onOk(() => {
    materialStore.deleteMaterial(material.id)
    $q.notify({ type: 'positive', message: 'Material deleted' })
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.hover-elevate {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.hover-elevate:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
</style>
