<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Class Management</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Define and manage tuition classes and schedules
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="black"
          icon="add"
          label="Create New Class"
          rounded
          class="q-px-md shadow-2"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- Stats summary for classes -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered class="rounded-borders modern-card bg-white q-pa-sm">
          <q-card-section horizontal class="items-center">
            <q-avatar
              :color="stat.color + '-1'"
              :text-color="stat.color"
              :icon="stat.icon"
              size="48px"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6 text-weight-bolder">{{ stat.value }}</div>
              <div class="text-caption text-grey-6 text-uppercase text-weight-bold">
                {{ stat.label }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Classes Table -->
    <q-card flat bordered class="rounded-borders modern-card overflow-hidden">
      <q-table
        :rows="classes"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
        class="bg-white modern-table"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Search classes..."
            outlined
            rounded
            bg-color="white"
            class="q-ml-md"
            style="min-width: 250px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-subject="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="28px" color="indigo-1" text-color="indigo" class="q-mr-sm">
                {{ props.row.subject.charAt(0) }}
              </q-avatar>
              <div class="text-weight-bold">{{ props.row.subject }}</div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-teacher="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="24px" class="q-mr-sm">
                <img :src="`https://api.dicebear.com/7.x/initials/svg?seed=${props.row.teacher}`" />
              </q-avatar>
              <div class="text-grey-8">{{ props.row.teacher }}</div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-fee="props">
          <q-td :props="props">
            <q-badge outline color="green-7" class="text-weight-bold">
              Rs. {{ props.row.fee.toLocaleString() }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <div class="q-gutter-xs">
              <q-btn
                flat
                round
                color="indigo"
                icon="visibility"
                size="sm"
                @click="viewClass(props.row)"
              />
              <q-btn
                flat
                round
                color="orange"
                icon="edit"
                size="sm"
                @click="editClass(props.row)"
              />
              <q-btn
                flat
                round
                color="red"
                icon="delete"
                size="sm"
                @click="confirmDelete(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Class Form Dialog -->
    <q-dialog v-model="showFormDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-borders modern-dialog">
        <q-card-section class="bg-black text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEditing ? 'Update Class Details' : 'Create New Class' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form @submit="saveClass" class="q-gutter-y-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="classForm.name"
                  label="Class Name"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                  placeholder="e.g. English - Grade 10 Saturday"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="classForm.subject"
                  label="Subject"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="classForm.grade"
                  :options="gradeOptions"
                  label="Grade"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="classForm.teacher"
                  label="Teacher Name"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                >
                  <template v-slot:prepend><q-icon name="person_outline" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="classForm.day"
                  :options="[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ]"
                  label="Day"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="classForm.startTime"
                  label="Start Time"
                  outlined
                  dense
                  type="time"
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="classForm.endTime"
                  label="End Time"
                  outlined
                  dense
                  type="time"
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="classForm.fee"
                  type="number"
                  label="Monthly Fee (Rs.)"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Required']"
                >
                  <template v-slot:prepend><q-icon name="payments" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="classForm.room"
                  label="Room / Hall"
                  outlined
                  dense
                  placeholder="Optional"
                />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancel" flat color="grey-7" v-close-popup />
              <q-btn
                :label="isEditing ? 'Update Class' : 'Create Class'"
                type="submit"
                color="black"
                unelevated
                rounded
                class="q-px-md text-weight-bold"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Class Details (Minimalists) -->
    <q-dialog v-model="showViewDialog">
      <q-card style="width: 400px" class="rounded-borders">
        <q-card-section class="bg-indigo-7 text-white">
          <div class="text-h6">{{ selectedClass.classCode }}</div>
          <div class="text-subtitle2">{{ selectedClass.name }}</div>
        </q-card-section>
        <q-card-section>
          <q-list dense padding>
            <q-item>
              <q-item-section avatar><q-icon name="person" color="indigo" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Teacher</q-item-label>
                <q-item-label class="text-weight-bold">{{ selectedClass.teacher }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="schedule" color="indigo" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Schedule</q-item-label>
                <q-item-label>{{ selectedClass.schedule }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="payments" color="green" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Monthly Fee</q-item-label>
                <q-item-label class="text-weight-bold">Rs. {{ selectedClass.fee }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="room" color="red" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Room</q-item-label>
                <q-item-label>{{ selectedClass.room || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="black" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useClassStore } from 'src/stores/classStore'

const $q = useQuasar()
const classStore = useClassStore()

onMounted(() => {
  classStore.fetchClasses()
})

const filter = ref('')
const loading = ref(false)
const showFormDialog = ref(false)
const showViewDialog = ref(false)
const isEditing = ref(false)
const selectedClass = ref({})

const classForm = ref({
  name: '',
  subject: '',
  grade: '',
  teacher: '',
  day: 'Saturday',
  startTime: '08:00',
  endTime: '10:00',
  fee: 2000,
  room: '',
})

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
  'Other',
]

const stats = computed(() => [
  { label: 'Total Classes', value: classStore.totalClasses, icon: 'class', color: 'indigo' },
  { label: 'Active Sessions', value: classStore.activeClasses, icon: 'bolt', color: 'orange' },
  {
    label: 'Teachers',
    value: new Set(classStore.classes.map((c) => c.teacher)).size,
    icon: 'groups',
    color: 'green',
  },
  {
    label: 'Rooms Used',
    value: new Set(classStore.classes.map((c) => c.room).filter((r) => r)).size,
    icon: 'meeting_room',
    color: 'purple',
  },
])

const columns = [
  { name: 'classCode', align: 'left', label: 'CODE', field: 'classCode', sortable: true },
  { name: 'subject', align: 'left', label: 'SUBJECT', field: 'subject', sortable: true },
  { name: 'grade', align: 'left', label: 'GRADE', field: 'grade', sortable: true },
  { name: 'teacher', align: 'left', label: 'TEACHER', field: 'teacher' },
  { name: 'schedule', align: 'left', label: 'SCHEDULE', field: 'schedule' },
  { name: 'fee', align: 'center', label: 'FEE', field: 'fee', sortable: true },
  { name: 'actions', align: 'right', label: 'ACTIONS', field: 'actions' },
]

const classes = computed(() => classStore.classes)

const openAddDialog = () => {
  isEditing.value = false
  classForm.value = {
    name: '',
    subject: '',
    grade: '',
    teacher: '',
    day: 'Saturday',
    startTime: '08:00',
    endTime: '10:00',
    fee: 2000,
    room: '',
  }
  showFormDialog.value = true
}

const editClass = (cls) => {
  isEditing.value = true
  classForm.value = { ...cls }
  showFormDialog.value = true
}

const viewClass = (cls) => {
  selectedClass.value = cls
  showViewDialog.value = true
}

const saveClass = async () => {
  loading.value = true

  // Format the helper schedule string for display
  const formatTime = (time) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  }

  classForm.value.schedule = `${classForm.value.day} ${formatTime(classForm.value.startTime)} - ${formatTime(classForm.value.endTime)}`

  try {
    if (isEditing.value) {
      await classStore.updateClass(classForm.value.id, classForm.value)
      $q.notify({ type: 'positive', message: 'Class updated successfully' })
    } else {
      await classStore.addClass(classForm.value)
      // Clear the search filter so the new class is visible
      filter.value = ''
      $q.notify({
        type: 'positive',
        message: 'New class created successfully',
        caption: 'Search filter cleared',
      })
    }
    showFormDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save class',
      caption: error.message || 'Database error',
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = (cls) => {
  $q.dialog({
    title: '<div class="text-red text-weight-bold">Confirm Deletion</div>',
    message: `Are you sure you want to delete the class <b>${cls.name}</b>? This will not affect student registrations directly.`,
    html: true,
    cancel: { label: 'Keep it', flat: true, color: 'grey-7' },
    ok: { label: 'Yes, Delete', color: 'red-7', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(() => {
    classStore.deleteClass(cls.id)
    $q.notify({ type: 'negative', message: 'Class deleted', icon: 'delete' })
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}
.modern-table :deep(thead tr th) {
  background-color: #fafafa;
  color: #757575;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.modern-dialog {
  border-radius: 20px;
  overflow: hidden;
}
</style>
