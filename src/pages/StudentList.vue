<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Student Directory</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">Manage and view all registered students</p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="black"
          icon="person_add"
          label="Register Student"
          rounded
          to="/dashboard/students/register"
          class="q-px-md shadow-2"
        />
      </div>
    </div>

    <!-- Stats Summary Row -->
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

    <!-- Student Table Card -->
    <q-card flat bordered class="rounded-borders modern-card overflow-hidden">
      <q-table
        :rows="students"
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
            placeholder="Search student..."
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

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" class="q-mr-sm shadow-1">
                <img :src="`https://api.dicebear.com/7.x/initials/svg?seed=${props.row.name}`" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-grey-9">{{ props.row.name }}</div>
                <div class="text-caption text-grey-5">{{ props.row.id_number }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <q-badge
              rounded
              color="green-1"
              text-color="green-9"
              class="q-px-sm q-py-xs text-weight-bold"
            >
              ACTIVE
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-subjects="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-badge
                v-for="sub in props.row.classes"
                :key="sub"
                color="indigo-1"
                text-color="indigo-9"
                class="q-px-sm q-py-xs text-weight-medium"
              >
                {{ sub }}
              </q-badge>
              <div
                v-if="!props.row.classes || props.row.classes.length === 0"
                class="text-caption text-grey-4 italic"
              >
                -
              </div>
            </div>
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
                @click="viewStudent(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="orange"
                icon="edit"
                size="sm"
                @click="editStudent(props.row)"
              >
                <q-tooltip>Edit Student</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="red"
                icon="delete"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete Record</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="teal"
                icon="qr_code"
                size="sm"
                @click="showIDCard(props.row)"
              >
                <q-tooltip>Generate Student ID Card</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- View Student Details Dialog -->
    <q-dialog v-model="showViewDialog" transition-show="scale" transition-hide="scale">
      <q-card style="width: 600px; max-width: 90vw" class="rounded-borders modern-dialog">
        <q-card-section class="bg-indigo text-white row items-center q-pb-none">
          <div class="text-h6">Student Profile</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-tabs
          v-model="activeTab"
          dense
          class="bg-indigo text-white"
          active-color="white"
          indicator-color="white"
          align="justify"
          narrow-indicator
        >
          <q-tab name="general" label="General" icon="person" />
          <q-tab name="attendance" label="Attendance" icon="fact_check" />
          <q-tab name="payments" label="Payments" icon="payments" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="general" class="q-pa-md">
            <div class="row items-center q-mb-lg">
              <q-avatar size="100px" class="q-mr-lg shadow-2">
                <img
                  :src="`https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudent.name}`"
                />
              </q-avatar>
              <div>
                <div class="text-h5 text-weight-bolder text-grey-9">{{ selectedStudent.name }}</div>
                <div class="text-subtitle1 text-indigo text-weight-bold">
                  {{ selectedStudent.id_number }}
                </div>
                <q-badge color="green-1" text-color="green-9" class="q-px-sm text-weight-bold"
                  >ACTIVE</q-badge
                >
              </div>
            </div>

            <q-list bordered separator class="rounded-borders">
              <q-item v-if="selectedStudent.grade">
                <q-item-section avatar><q-icon name="school" color="indigo" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Grade / Level</q-item-label>
                  <q-item-label class="text-weight-bold">{{ selectedStudent.grade }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="selectedStudent.classes && selectedStudent.classes.length">
                <q-item-section avatar><q-icon name="book" color="indigo" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Enrolled Subjects</q-item-label>
                  <div class="row q-gutter-xs q-mt-xs">
                    <q-badge
                      v-for="cls in selectedStudent.classes"
                      :key="cls"
                      color="indigo-1"
                      text-color="indigo-9"
                    >
                      {{ cls }}
                    </q-badge>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="phone" color="indigo" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Student Phone</q-item-label>
                  <q-item-label class="text-weight-bold">{{
                    selectedStudent.phone || '-'
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="selectedStudent.parent">
                <q-item-section avatar
                  ><q-icon name="family_restroom" color="green"
                /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Parent Name</q-item-label>
                  <q-item-label class="text-weight-bold">{{ selectedStudent.parent }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="selectedStudent.parentPhone">
                <q-item-section avatar><q-icon name="phone_iphone" color="green" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Parent Contact</q-item-label>
                  <q-item-label class="text-weight-bold">{{
                    selectedStudent.parentPhone
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="selectedStudent.regDate">
                <q-item-section avatar><q-icon name="event" color="grey-7" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Registration Date</q-item-label>
                  <q-item-label class="text-weight-bold">{{
                    selectedStudent.regDate
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="attendance" class="q-pa-none">
            <q-list separator v-if="studentAttendanceHistory.length > 0">
              <q-item v-for="record in studentAttendanceHistory" :key="record.id">
                <q-item-section avatar>
                  <q-icon
                    :name="record.status ? 'check_circle' : 'cancel'"
                    :color="record.status ? 'green' : 'red'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    getClassName(record.classId)
                  }}</q-item-label>
                  <q-item-label caption>{{ record.date }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    :color="record.status ? 'green-1' : 'red-1'"
                    :text-color="record.status ? 'green' : 'red'"
                  >
                    {{ record.status ? 'Present' : 'Absent' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="q-pa-xl text-center text-grey-6">
              <q-icon name="history" size="48px" class="q-mb-sm" />
              <div>No attendance records found.</div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="payments" class="q-pa-none">
            <q-list separator v-if="studentPaymentHistory.length > 0">
              <q-item v-for="payment in studentPaymentHistory" :key="payment.id">
                <q-item-section avatar>
                  <q-icon name="receipt_long" color="indigo" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold"
                    >Rs. {{ payment.amount.toLocaleString() }}</q-item-label
                  >
                  <q-item-label caption
                    >{{ payment.className }} • {{ payment.month }} {{ payment.year }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <div class="text-caption text-grey-7">{{ payment.date }}</div>
                  <div class="text-caption text-indigo text-weight-bold">
                    {{ payment.receiptNo }}
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="q-pa-xl text-center text-grey-6">
              <q-icon name="payments" size="48px" class="q-mb-sm" />
              <div>No payment records found.</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="grey-7" flat v-close-popup />
          <q-btn
            label="Edit"
            color="orange"
            unelevated
            rounded
            @click="editStudent(selectedStudent)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Student ID Card Dialog -->
    <q-dialog v-model="idCardDialog" transition-show="scale" transition-hide="scale">
      <q-card stretch class="id-card-wrapper" style="width: 400px; border-radius: 20px">
        <q-card-section class="q-pa-none">
          <div
            class="id-card modern-id-design relative-position overflow-hidden"
            id="student-id-printable"
          >
            <!-- Card Header/Background decoration -->
            <div class="id-header-bg"></div>

            <div class="q-pa-lg text-center relative-position">
              <div class="text-h6 text-white text-weight-bolder q-mb-xs">ANW TUITION</div>
              <div class="text-caption text-indigo-2 text-weight-bold q-mb-md">
                OFFICIAL STUDENT ID
              </div>

              <q-avatar size="110px" class="q-mb-md shadow-5 border-white">
                <img
                  :src="`https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudent.name}`"
                />
              </q-avatar>

              <div class="text-h5 text-weight-bolder text-grey-9 q-mb-none line-height-tight">
                {{ selectedStudent.name }}
              </div>
              <div class="text-subtitle1 text-indigo text-weight-bold q-mb-sm">
                {{ selectedStudent.id_number }}
              </div>

              <div class="row justify-between q-mt-md q-px-md text-left">
                <div>
                  <div class="text-caption text-grey-6 uppercase">Grade</div>
                  <div class="text-subtitle2 text-weight-bold">{{ selectedStudent.grade }}</div>
                </div>
                <div>
                  <div class="text-caption text-grey-6 uppercase">Issued</div>
                  <div class="text-subtitle2 text-weight-bold">{{ selectedStudent.regDate }}</div>
                </div>
              </div>

              <div class="q-mt-md flex flex-center">
                <div class="qr-container q-pa-sm bg-white rounded-borders shadow-3">
                  <img
                    :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${selectedStudent.id_number}`"
                    alt="QR Code"
                    width="100"
                  />
                </div>
              </div>

              <div class="text-center q-mt-sm text-caption text-grey-5 italic">
                Scan for attendance
              </div>
            </div>

            <div class="id-footer">
              <div class="text-caption text-white text-weight-light">anwtuition.lk</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md no-print">
          <q-btn flat label="Close" color="grey-7" v-close-popup />
          <q-btn
            label="Print ID Card"
            color="black"
            icon="print"
            unelevated
            rounded
            @click="printID"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'
import { useAttendanceStore } from 'src/stores/attendanceStore'
import { usePaymentStore } from 'src/stores/paymentStore'
import { useRouter, useRoute } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const studentStore = useStudentStore()
const classStore = useClassStore()
const attendanceStore = useAttendanceStore()
const paymentStore = usePaymentStore()

const filter = ref('')
const activeTab = ref('general')
const showViewDialog = ref(false)
const idCardDialog = ref(false)
const selectedStudent = ref({})

onMounted(() => {
  studentStore.fetchStudents()
  if (route.query.q) {
    filter.value = route.query.q
  }
})

watch(
  () => route.query.q,
  (newQ) => {
    if (newQ) filter.value = newQ
  },
)

const stats = computed(() => [
  { label: 'Total Students', value: studentStore.totalStudents, icon: 'groups', color: 'indigo' },
  { label: 'Current Month', value: studentStore.totalStudents, icon: 'person_add', color: 'green' },
  {
    label: 'O/L Students',
    value: studentStore.studentsByGrade('Grade 10') + studentStore.studentsByGrade('Grade 11'),
    icon: 'school',
    color: 'orange',
  },
  {
    label: 'A/L Students',
    value: studentStore.studentsByGrade('A/L Year 1') + studentStore.studentsByGrade('A/L Year 2'),
    icon: 'auto_stories',
    color: 'purple',
  },
])

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'STUDENT NAME',
    field: (row) => `${row.name} ${row.id_number}`,
    sortable: true,
  },
  { name: 'grade', align: 'left', label: 'GRADE', field: 'grade', sortable: true },
  { name: 'subjects', align: 'left', label: 'ENROLLED SUBJECTS', field: 'classes' },
  { name: 'phone', align: 'left', label: 'CONTACT', field: 'phone' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'actions', align: 'right', label: 'ACTIONS', field: 'actions' },
]

const students = computed(() => studentStore.students)

const studentAttendanceHistory = computed(() => {
  if (!selectedStudent.value.id) return []
  return attendanceStore.getStudentAttendance(selectedStudent.value.id)
})

const studentPaymentHistory = computed(() => {
  if (!selectedStudent.value.id) return []
  return paymentStore.getPaymentsByStudent(selectedStudent.value.id)
})

const getClassName = (classId) => {
  const cls = classStore.classes.find((c) => c.id === classId)
  return cls ? cls.name : 'Unknown Class'
}

// --- Actions ---
const viewStudent = (student) => {
  selectedStudent.value = student
  showViewDialog.value = true
}

const showIDCard = (student) => {
  selectedStudent.value = student
  idCardDialog.value = true
}

const printID = () => {
  window.print()
}

const editStudent = (student) => {
  router.push(`/dashboard/students/edit/${student.id}`)
}

const confirmDelete = (student) => {
  $q.dialog({
    title: '<div class="text-red-7 text-weight-bold">Confirm Deletion</div>',
    message: `Are you sure you want to delete <b>${student.name}</b> (${student.id_number})? This action cannot be undone.`,
    html: true,
    cancel: { label: 'Keep it', flat: true, color: 'grey-7' },
    ok: { label: 'Yes, Delete', color: 'red-7', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(() => {
    studentStore.removeStudent(student.id)
    $q.notify({
      color: 'negative',
      message: `${student.name} has been removed.`,
      icon: 'delete',
      position: 'bottom',
    })
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

/* ID Card Styles */
.modern-id-design {
  background: white;
  min-height: 520px;
  border: 1px solid #eee;
}

.id-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  clip-path: ellipse(110% 80% at 50% 0%);
}

.id-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-white {
  border: 4px solid white;
}

.qr-container {
  border: 1px solid #eee;
}

@media print {
  @page {
    size: auto;
    margin: 0mm; /* Removes browser headers/footers like URL and Date */
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  .no-print {
    display: none !important;
  }

  /* Force background colors to print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .q-layout,
  .q-header,
  .q-drawer,
  .q-page-container,
  .q-dialog__backdrop {
    display: none !important;
  }

  .q-dialog__inner {
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: white !important;
    z-index: 99999 !important;
  }

  .id-card-wrapper {
    box-shadow: none !important;
    border: none !important;
    transform: scale(1) !important; /* Ensure it's original size on paper */
  }
}
</style>
