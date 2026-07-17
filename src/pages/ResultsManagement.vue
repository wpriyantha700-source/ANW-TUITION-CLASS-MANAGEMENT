<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Results & Evaluations</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Manage student exams, marks and progress reports
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="black"
          icon="add"
          label="Create New Exam"
          rounded
          unelevated
          @click="showCreateDialog = true"
          class="q-px-lg shadow-2"
        />
      </div>
    </div>

    <!-- Exam Cards Grid -->
    <div class="row q-col-gutter-lg">
      <div v-for="exam in exams" :key="exam.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat bordered class="rounded-borders modern-card full-height">
          <q-card-section class="bg-indigo-7 text-white q-py-md">
            <div class="row items-center justify-between no-wrap">
              <div class="text-subtitle1 text-weight-bold ellipsis">{{ exam.title }}</div>
              <div class="row items-center no-wrap">
                <q-badge color="white" text-color="indigo-9" class="text-weight-bold q-mr-sm">
                  {{ exam.date }}
                </q-badge>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  size="sm"
                  color="white"
                  @click.stop="confirmDeleteExam(exam)"
                >
                  <q-tooltip class="bg-red">Delete Exam</q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="text-caption opacity-80 row items-center q-mt-xs">
              <q-icon name="class" size="xs" class="q-mr-xs" />
              {{ getClassName(exam) }}
            </div>
          </q-card-section>
          <q-card-section class="q-pa-md">
            <div class="row q-mb-md items-center justify-around text-center">
              <div class="col">
                <div class="text-h5 text-weight-bold text-grey-9">{{ exam.results.length }}</div>
                <div class="text-caption text-grey-6">Processed</div>
              </div>
              <q-separator vertical inset />
              <div class="col">
                <div class="text-h5 text-weight-bold text-primary">
                  {{ getAverageMarks(exam) }}%
                </div>
                <div class="text-caption text-grey-6">Avg. Class</div>
              </div>
              <q-separator vertical inset />
              <div class="col">
                <div class="text-h5 text-weight-bold text-green">{{ getMaxMarks(exam) }}</div>
                <div class="text-caption text-grey-6">Top Score</div>
              </div>
            </div>
            <div class="row q-gutter-sm justify-center">
              <q-btn
                outline
                color="indigo"
                icon="edit_note"
                label="Enter Results"
                class="col rounded-borders"
                @click="openResultEntry(exam)"
              />
              <q-btn
                outline
                color="grey-7"
                icon="description"
                label="Report"
                class="col rounded-borders"
                @click="viewReport(exam)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="exams.length === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="assignment_late" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-5 q-mt-md">No exams created yet</div>
      </div>
    </div>

    <!-- Create Exam Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="width: 500px; border-radius: 20px" class="q-pa-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold text-grey-9">Create New Exam</div>
          <div class="text-caption text-grey-6">Configure basic details for the evaluation</div>
        </q-card-section>
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="newExam.title"
            label="Exam Title"
            outlined
            dense
            :rules="[(val) => !!val || 'Title is required']"
          />
          <q-select
            v-model="newExam.classId"
            :options="filteredClassOptions"
            label="Target Class"
            outlined
            dense
            option-label="name"
            option-value="id"
            emit-value
            map-options
            use-input
            @filter="filterClasses"
            @new-value="createValue"
            placeholder="Type and press Enter for custom subjects"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No matching classes found </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="newExam.date"
                label="Exam Date"
                type="date"
                outlined
                dense
                stack-label
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newExam.totalMarks"
                label="Total Marks"
                type="number"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-mt-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            label="Create Exam"
            color="black"
            unelevated
            rounded
            class="q-px-lg"
            @click="handleCreateExam"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Result Entry Dialog -->
    <q-dialog
      v-model="showResultDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-1">
        <q-bar class="bg-indigo-7 text-white q-py-lg" style="height: auto">
          <div class="column q-py-sm">
            <div class="text-subtitle1 text-weight-bold">
              Enter Results: {{ currentExam?.title }}
            </div>
            <div class="text-caption opacity-80">
              Session: {{ currentExam?.grade }} {{ currentExam?.subject }}
            </div>
          </div>
          <q-space />

          <!-- Desktop Filters -->
          <div class="row items-center q-gutter-x-sm gt-xs q-mr-md">
            <q-input
              v-model="gradeSearch"
              placeholder="Grade (e.g. 10)"
              dense
              dark
              outlined
              class="bg-indigo-6"
              style="width: 120px"
              @keyup.enter="refreshResultEntry"
            />
            <q-input
              v-model="subjectSearch"
              placeholder="Subject (e.g. Math)"
              dense
              dark
              outlined
              class="bg-indigo-6"
              style="width: 150px"
              @keyup.enter="refreshResultEntry"
            />
            <q-btn flat round dense icon="search" color="white" @click="refreshResultEntry">
              <q-tooltip>Load Students</q-tooltip>
            </q-btn>

            <q-separator vertical dark class="q-mx-sm" />

            <q-input
              v-model="resultsFilter"
              placeholder="Filter list..."
              dense
              dark
              outlined
              rounded
              class="bg-indigo-6"
              style="width: 180px"
            >
              <template v-slot:prepend><q-icon name="filter_list" size="xs" /></template>
            </q-input>

            <q-toggle
              v-model="showAllStudents"
              label="All"
              color="white"
              keep-color
              dense
              class="text-caption text-weight-bold"
              @update:model-value="refreshResultEntry"
            />
            <q-btn
              flat
              round
              dense
              icon="refresh"
              color="white"
              @click="refreshResultEntry"
              :loading="studentStore.loading"
            >
              <q-tooltip>Refresh Data</q-tooltip>
            </q-btn>
          </div>

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <div class="lt-sm q-pa-sm bg-indigo-7 text-white column q-gutter-y-xs">
          <div class="row q-gutter-x-xs">
            <q-input
              v-model="gradeSearch"
              placeholder="Grade"
              dense
              dark
              outlined
              class="bg-indigo-6 col"
            />
            <q-input
              v-model="subjectSearch"
              placeholder="Subject"
              dense
              dark
              outlined
              class="bg-indigo-6 col-7"
            />
            <q-btn flat dense icon="search" @click="refreshResultEntry" />
          </div>
          <div class="row items-center justify-between">
            <q-input
              v-model="resultsFilter"
              placeholder="Filter names..."
              dense
              dark
              outlined
              rounded
              class="bg-indigo-6 col"
            >
              <template v-slot:prepend><q-icon name="filter_list" size="xs" /></template>
            </q-input>
            <q-toggle
              v-model="showAllStudents"
              label="All"
              color="white"
              keep-color
              dense
              class="text-caption text-weight-bold q-ml-sm"
              @update:model-value="refreshResultEntry"
            />
          </div>
        </div>

        <q-card-section class="q-pa-md">
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <q-card flat bordered class="rounded-borders modern-card bg-white">
                <q-table
                  :rows="filteredBatchResults"
                  :columns="resultColumns"
                  flat
                  bordered
                  row-key="studentId"
                  :pagination="{ rowsPerPage: 0 }"
                  hide-bottom
                >
                  <template v-slot:no-data>
                    <div class="full-width column flex-center q-pa-xl text-grey-6 text-center">
                      <q-icon name="person_search" size="64px" class="q-mb-md" />
                      <div class="text-subtitle1 text-weight-bold">
                        No students found for this class
                      </div>
                      <div class="text-caption q-mb-md">
                        Try searching for a different name or enable 'Show All Students' to pick
                        from the entire list.
                      </div>
                      <div class="row q-gutter-sm">
                        <q-btn
                          label="Show All Students"
                          color="indigo"
                          unelevated
                          rounded
                          icon="people"
                          @click="showAllAndRefresh"
                        />
                        <q-btn
                          label="Clear Search"
                          color="grey-7"
                          outline
                          rounded
                          @click="resultsFilter = ''"
                        />
                      </div>
                    </div>
                  </template>

                  <template v-slot:body-cell-studentName="props">
                    <q-td :props="props">
                      <div class="text-weight-bold text-indigo-9">{{ props.row.name }}</div>
                      <div class="text-caption text-grey-7" style="font-size: 0.75rem">
                        {{ props.row.studentGrade }} •
                        {{ (props.row.studentSubjects || []).join(', ') }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-marks="props">
                    <q-td :props="props">
                      <q-input
                        v-model.number="props.row.marks"
                        type="number"
                        outlined
                        dense
                        bg-color="indigo-1"
                        input-class="text-center text-weight-bold text-indigo-10"
                        placeholder="Marks"
                        @update:model-value="calculateGrade(props.row)"
                        @keyup.enter="focusNext(props.rowIndex)"
                        :ref="
                          (el) => {
                            if (el) inputRefs[props.rowIndex] = el
                          }
                        "
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-grade="props">
                    <q-td :props="props" class="text-center">
                      <q-badge
                        :color="getGradeColor(props.row.grade)"
                        class="text-weight-bold q-px-md q-py-xs shadow-1"
                        style="font-size: 0.9rem"
                      >
                        {{ props.row.grade }}
                      </q-badge>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-remarks="props">
                    <q-td :props="props">
                      <q-input
                        v-model="props.row.remarks"
                        outlined
                        dense
                        placeholder="Add a remark..."
                      />
                    </q-td>
                  </template>
                </q-table>

                <div class="q-pa-md row justify-end q-gutter-sm">
                  <q-btn flat label="Discard" color="grey-7" v-close-popup />
                  <q-btn
                    label="Save All Results"
                    color="black"
                    unelevated
                    rounded
                    class="q-px-xl"
                    @click="saveBatchResults"
                  />
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Progress Report Dialog -->
    <q-dialog v-model="showReportDialog" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-white">
        <q-bar class="bg-dark text-white q-py-lg no-print">
          <div class="text-subtitle1 text-weight-bold">Class Progress Report</div>
          <q-space />
          <q-btn flat icon="print" label="Print Report" @click="printReport" class="q-mr-sm" />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-xl report-print-area">
          <div class="report-header text-center q-mb-xl">
            <h2
              class="text-h3 text-weight-bolder q-ma-none text-indigo-10 serif-font letter-spacing-2 uppercase"
            >
              Class Progress & Evaluation Report
            </h2>
            <div class="row justify-center q-mt-md">
              <div class="col-6 border-gold-thin"></div>
            </div>
          </div>

          <div class="row q-col-gutter-lg q-mb-xl">
            <div class="col-12 col-md-6">
              <div class="q-pa-md bg-grey-1 rounded-borders border-left-indigo">
                <div class="text-caption text-grey-7 uppercase">Evaluation Details</div>
                <div class="text-h5 text-weight-bold">{{ reportExam?.title }}</div>
                <div class="text-subtitle2 text-grey-8">Class: {{ getClassName(reportExam) }}</div>
                <div class="text-subtitle2 text-grey-8">Date: {{ reportExam?.date }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-sm full-height">
                <div class="col-4">
                  <div
                    class="q-pa-sm bg-indigo-1 text-center rounded-borders full-height border-indigo-light"
                  >
                    <div class="text-h6 text-weight-bolder text-indigo-9">
                      {{ getAverageMarks(reportExam) }}%
                    </div>
                    <div class="text-caption text-indigo-7">Avg. Class</div>
                  </div>
                </div>
                <div class="col-4">
                  <div
                    class="q-pa-sm bg-green-1 text-center rounded-borders full-height border-green-light"
                  >
                    <div class="text-h6 text-weight-bolder text-green-9">
                      {{ getMaxMarks(reportExam) }}
                    </div>
                    <div class="text-caption text-green-7">Top Score</div>
                  </div>
                </div>
                <div class="col-4">
                  <div
                    class="q-pa-sm bg-amber-1 text-center rounded-borders full-height border-amber-light"
                  >
                    <div class="text-h6 text-weight-bolder text-amber-9">
                      {{ reportExam?.results.length }}
                    </div>
                    <div class="text-caption text-amber-7">Recorded</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-table
            :rows="reportExam?.results || []"
            :columns="reportColumns"
            flat
            bordered
            row-key="studentId"
            :pagination="{ rowsPerPage: 0 }"
            hide-bottom
            class="report-table"
          >
            <template v-slot:body-cell-grade="props">
              <q-td :props="props" class="text-center font-bold">
                <span :class="`text-${getGradeColor(props.value)}`">{{ props.value }}</span>
              </q-td>
            </template>
          </q-table>

          <div class="report-footer q-mt-xl row justify-between items-end">
            <div class="text-caption text-grey-5 italic">
              Generated on {{ new Date().toLocaleString() }}
            </div>
            <div class="text-center">
              <div class="signature-line q-mb-sm"></div>
              <div class="text-weight-bold">Authorized Signature</div>
              <div class="text-caption text-grey-6">{{ instituteName }} Management</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useExamStore } from 'src/stores/examStore'
import { useClassStore } from 'src/stores/classStore'
import { useStudentStore } from 'src/stores/studentStore'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const examStore = useExamStore()
const classStore = useClassStore()
const studentStore = useStudentStore()
const userStore = useUserStore()

const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition')

const showCreateDialog = ref(false)
const showResultDialog = ref(false)
const showReportDialog = ref(false)
const currentExam = ref(null)
const reportExam = ref(null)
const batchResults = ref([])
const showAllStudents = ref(false)
const resultsFilter = ref('')
const gradeSearch = ref('')
const subjectSearch = ref('')
const inputRefs = ref([])

onMounted(async () => {
  await studentStore.fetchStudents()
  await classStore.fetchClasses()
  await examStore.fetchExams()
})

// Auto-refresh when students arrive or change
watch(
  () => studentStore.students,
  (newVal) => {
    if (showResultDialog.value && newVal && newVal.length > 0) {
      refreshResultEntry()
    }
  },
  { deep: true },
)

const showAllAndRefresh = () => {
  showAllStudents.value = true
  refreshResultEntry()
}

const focusNext = (index) => {
  if (inputRefs.value[index + 1]) {
    inputRefs.value[index + 1].focus()
  }
}

const exams = computed(() => examStore.exams)
const filteredClassOptions = ref(classStore.classes)

const filterClasses = (val, update) => {
  if (val === '') {
    update(() => {
      filteredClassOptions.value = classStore.classes
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredClassOptions.value = classStore.classes.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const createValue = (val, done) => {
  if (val.length > 0) {
    if (!classStore.classes.some((v) => v.name.toLowerCase() === val.toLowerCase())) {
      done(val, 'add-unique')
    }
  }
}

const newExam = reactive({
  title: '',
  classId: null,
  date: new Date().toISOString().split('T')[0],
  totalMarks: 100,
})

const resultColumns = [
  { name: 'studentName', label: 'Student Name', align: 'left', field: 'name', sortable: true },
  {
    name: 'marks',
    label: 'Marks Obtained',
    align: 'center',
    field: 'marks',
    style: 'width: 120px',
  },
  { name: 'grade', label: 'Grade', align: 'center', field: 'grade' },
  { name: 'remarks', label: 'Remarks / Observations', align: 'left', field: 'remarks' },
]

const reportColumns = [
  { name: 'studentName', label: 'Student Name', align: 'left', field: 'name', sortable: true },
  { name: 'marks', label: 'Marks', align: 'center', field: 'marks', sortable: true },
  { name: 'grade', label: 'Grade', align: 'center', field: 'grade' },
  { name: 'remarks', label: 'Teacher Remarks', align: 'left', field: 'remarks' },
]

const getClassName = (exam) => {
  if (!exam) return 'N/A'

  // Fetch from class store if classId exists
  if (exam.classId) {
    const found = classStore.classes.find((c) => c.id === exam.classId)
    if (found) return found.name
    // If classId is a string name (custom class), return it
    if (typeof exam.classId === 'string' && exam.classId.length < 30) return exam.classId
  }

  // Fallback to saved grade and subject
  if (exam.subject && exam.grade) {
    return `${exam.subject} - Grade ${exam.grade}`
  }
  if (exam.subject) return exam.subject
  if (exam.grade) return `Grade ${exam.grade}`

  return 'N/A'
}

const getAverageMarks = (exam) => {
  if (!exam || !exam.results || exam.results.length === 0) return 0
  const total = exam.results.reduce((acc, curr) => acc + (curr.marks || 0), 0)
  return Math.round(total / exam.results.length)
}

const getMaxMarks = (exam) => {
  if (!exam || !exam.results || exam.results.length === 0) return 0
  return Math.max(...exam.results.map((r) => r.marks || 0))
}

const handleCreateExam = async () => {
  if (!newExam.title || !newExam.classId) return

  try {
    // Find grade from class if it exists
    const targetClass = classStore.classes.find((c) => c.id === newExam.classId)
    const grade = targetClass ? targetClass.grade : null
    const subject = targetClass
      ? targetClass.subject
      : typeof newExam.classId === 'string'
        ? newExam.classId
        : null

    await examStore.addExam({
      ...newExam,
      grade,
      subject,
    })

    showCreateDialog.value = false
    $q.notify({ type: 'positive', message: 'Exam created successfully' })
  } catch (error) {
    console.error('Database error in addExam:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create exam',
    })
  }
}

const filteredBatchResults = computed(() => {
  if (!resultsFilter.value) return batchResults.value
  const f = resultsFilter.value.toLowerCase().trim()
  return batchResults.value.filter((r) => {
    const nameMatch = (r.name || '').toLowerCase().includes(f)
    const gradeMatch = (r.studentGrade || '').toString().toLowerCase().includes(f)
    const subjectsMatch = (r.studentSubjects || []).some((s) =>
      s.toString().toLowerCase().includes(f),
    )
    return nameMatch || gradeMatch || subjectsMatch
  })
})

const openResultEntry = (exam) => {
  currentExam.value = exam
  gradeSearch.value = exam.grade || ''
  subjectSearch.value = exam.subject || ''
  refreshResultEntry()
  showResultDialog.value = true
}

const refreshResultEntry = () => {
  const exam = currentExam.value
  if (!exam) return

  let classStudents = []

  if (showAllStudents.value) {
    classStudents = studentStore.students
  } else {
    // Advanced filtering based on Manual Grade and Subject inputs
    classStudents = studentStore.students.filter((s) => {
      // 1. Better Grade Matching
      const sGradeRaw = (s.grade || '').toString().toLowerCase().trim()
      const searchGradeRaw = gradeSearch.value.toString().toLowerCase().trim()

      // Pull numeric part (e.g., "10" from "Grade 10")
      const sGradeNum = sGradeRaw.replace(/[^0-9]/g, '')
      const searchGradeNum = searchGradeRaw.replace(/[^0-9]/g, '')

      const gradeMatch =
        !searchGradeRaw ||
        sGradeRaw.includes(searchGradeRaw) ||
        searchGradeRaw.includes(sGradeRaw) ||
        (sGradeNum && searchGradeNum && sGradeNum === searchGradeNum)

      if (!gradeMatch) return false

      // 2. Better Subject Matching
      const searchSub = subjectSearch.value.toString().toLowerCase().trim()
      if (!searchSub) return true // Only grade filter if subject empty

      return (s.classes || []).some((cName) => {
        if (!cName) return false
        const targetName = cName.toString().trim().toLowerCase()
        return targetName.includes(searchSub) || searchSub.includes(targetName)
      })
    })
  }

  // Map students to results structure
  const examResults = exam.results || []

  batchResults.value = classStudents.map((student) => {
    // Find if we already have a result for this student in this exam
    const existing = examResults.find((r) => r.studentId === student.id)

    // Check if we have unsaved modified values in the current batchResults (to avoid overwriting while typing)
    const currentUnsaved = batchResults.value.find((b) => b.studentId === student.id)

    return {
      studentId: student.id,
      name: student.name || 'Unknown Student',
      studentGrade: student.grade || 'N/A',
      studentSubjects: student.classes || [],
      marks: currentUnsaved ? currentUnsaved.marks : existing ? existing.marks : null,
      grade: currentUnsaved ? currentUnsaved.grade : existing ? existing.grade : '-',
      remarks: currentUnsaved ? currentUnsaved.remarks : existing ? existing.remarks : '',
    }
  })
}

const calculateGrade = (row) => {
  if (row.marks === null || row.marks === undefined || row.marks === '') {
    row.grade = '-'
    return
  }
  const score = row.marks
  if (score >= 75) row.grade = 'A'
  else if (score >= 65) row.grade = 'B'
  else if (score >= 50) row.grade = 'C'
  else if (score >= 35) row.grade = 'S'
  else row.grade = 'F'
}

const getGradeColor = (grade) => {
  const colors = { A: 'green', B: 'light-green', C: 'amber', S: 'orange', F: 'red', '-': 'grey-6' }
  return colors[grade] || 'grey'
}

const saveBatchResults = async () => {
  try {
    await examStore.updateResults(currentExam.value.id, [...batchResults.value])
    showResultDialog.value = false
    $q.notify({ type: 'positive', message: 'All results saved successfully!', icon: 'cloud_done' })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save results' })
  }
}

const viewReport = (exam) => {
  reportExam.value = exam
  showReportDialog.value = true
}

const printReport = () => {
  window.print()
}

const confirmDeleteExam = (exam) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete <b>"${exam.title}"</b>? This will also remove all student results for this exam.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Delete',
      flat: true,
    },
  }).onOk(() => {
    examStore.deleteExam(exam.id)
    $q.notify({
      type: 'positive',
      message: 'Exam deleted successfully',
      icon: 'delete_sweep',
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
  transition: all 0.3s ease;
}
.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.08);
}
.opacity-80 {
  opacity: 0.8;
}

/* Report Styles */
.serif-font {
  font-family: 'Times New Roman', serif;
}
.letter-spacing-2 {
  letter-spacing: 2px;
}
.border-gold-thin {
  border-bottom: 2px solid #d4af37;
}
.border-left-indigo {
  border-left: 5px solid #3f51b5;
}
.border-indigo-light {
  border: 1px solid #e8eaf6;
}
.border-green-light {
  border: 1px solid #e8f5e9;
}
.border-amber-light {
  border: 1px solid #fff8e1;
}
.signature-line {
  border-top: 1px solid #333;
  width: 200px;
}
.report-table :deep(th) {
  background-color: #f5f5f5;
  font-weight: bold;
}

@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  body {
    visibility: hidden;
    background: white !important;
  }
  .report-print-area,
  .report-print-area * {
    visibility: visible;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .report-header h2 {
    font-size: 24pt !important;
    line-height: 1.1 !important;
    margin-bottom: 5mm !important;
    white-space: normal !important;
    display: block !important;
  }
  .border-gold-thin {
    border-bottom: 2px solid #d4af37 !important;
  }
  .report-table {
    width: 100% !important;
    border: 1.5px solid #000 !important;
    margin-top: 5mm;
  }
  .report-table :deep(table) {
    border-collapse: collapse !important;
  }
  .report-table :deep(th) {
    background-color: #f5f5f5 !important;
    color: #000 !important;
    font-weight: bold !important;
    border: 1px solid #000 !important;
    padding: 8px !important;
  }
  .report-table :deep(td) {
    border: 1px solid #000 !important;
    padding: 6px 8px !important;
  }
  .row {
    display: flex !important;
    flex-wrap: nowrap !important;
  }
  .col-12.col-md-6 {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  .col-4 {
    flex: 0 0 33.333% !important;
    max-width: 33.333% !important;
  }
  .q-pa-xl {
    padding: 5mm !important;
  }
  .signature-line {
    border-top: 1.5px solid #000 !important;
    width: 200px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}
</style>
