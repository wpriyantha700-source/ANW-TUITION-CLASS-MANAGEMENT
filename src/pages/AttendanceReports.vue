<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Attendance Reports</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Analyze monthly attendance patterns by subject
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none no-print">
        <q-btn
          color="black"
          icon="print"
          label="Print Report"
          rounded
          unelevated
          @click="handlePrint"
          class="q-px-lg shadow-2"
          :disable="!reportData.length"
        />
      </div>
    </div>

    <!-- Filter Card -->
    <q-card flat bordered class="rounded-borders modern-card q-mb-lg no-print">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-2">
            <q-select
              v-model="selectedGrade"
              :options="gradeOptions"
              label="Select Grade"
              outlined
              dense
              bg-color="white"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="selectedSubject"
              :options="filteredSubjectOptions"
              label="Select Subject"
              outlined
              dense
              bg-color="white"
              use-input
              clearable
              fill-input
              hide-selected
              input-debounce="0"
              @filter="filterSubjects"
              @input-value="(val) => (subjectInput = val)"
              :disable="!selectedGrade"
              placeholder="Type or select subject"
              new-value-mode="add-unique"
              @new-value="createSubjectValue"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results found </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-2">
            <q-select
              v-model="selectedTeacher"
              :options="filteredTeacherOptions"
              label="Select Teacher"
              outlined
              dense
              bg-color="white"
              use-input
              clearable
              fill-input
              hide-selected
              input-debounce="0"
              @filter="filterTeachers"
              :disable="!selectedSubject"
              placeholder="Select teacher"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results found </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-2">
            <q-input
              v-model="selectedMonth"
              label="Select Month"
              outlined
              dense
              type="month"
              bg-color="white"
            />
          </div>
          <div class="col-12 col-sm-2">
            <q-input
              v-model="studentSearch"
              label="Search Student"
              outlined
              dense
              bg-color="white"
              clearable
              placeholder="Search..."
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Report Table -->
    <q-card flat bordered class="rounded-borders modern-card overflow-hidden">
      <div v-if="!selectedSubject || !selectedMonth" class="q-pa-xl text-center">
        <q-icon name="analytics" size="100px" color="grey-3" />
        <div class="text-h6 text-grey-5 q-mt-md">
          Please select Grade, Subject and Month to generate the report
        </div>
      </div>

      <div v-else-if="reportData.length === 0" class="q-pa-xl text-center">
        <q-icon name="sentiment_dissatisfied" size="100px" color="grey-3" />
        <div class="text-h6 text-grey-5 q-mt-md">
          No attendance records found for the selected criteria
        </div>
      </div>

      <div v-else class="report-container">
        <div class="q-pa-md bg-indigo-7 text-white row items-center justify-between">
          <div>
            <div class="text-caption text-indigo-1 uppercase text-weight-bolder letter-spacing-1">
              {{ instituteName }} - Official Attendance Report
            </div>
            <div class="text-h6 text-weight-bold uppercase">
              {{ selectedSubject }} - {{ selectedGrade }}
              <span v-if="selectedTeacher" class="text-weight-medium">
                ({{ selectedTeacher }})
              </span>
            </div>
            <div class="text-caption opacity-80">
              Attendance Summary for {{ formatDateMonth(selectedMonth) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-h5 text-weight-bold">{{ averageAttendance }}%</div>
            <div class="text-caption opacity-80">Avg. Attendance</div>
          </div>
        </div>

        <q-markup-table flat bordered class="report-table">
          <thead>
            <tr>
              <th class="text-left sticky-column">Student Name</th>
              <th v-for="date in activeDates" :key="date" class="text-center rotate-th">
                <div class="date-label">{{ formatDateShort(date) }}</div>
              </th>
              <th class="text-center font-bold bg-grey-2">Total %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="std in reportData" :key="std.id">
              <td class="text-left sticky-column">
                <div class="text-weight-bold">{{ std.name }}</div>
                <div class="text-caption text-grey-6">{{ std.id_number }}</div>
              </td>
              <td v-for="date in activeDates" :key="date" class="text-center">
                <q-icon
                  :name="
                    std.attendance[date] === 'present'
                      ? 'check_circle'
                      : std.attendance[date] === 'absent'
                        ? 'cancel'
                        : 'remove'
                  "
                  :color="
                    std.attendance[date] === 'present'
                      ? 'green'
                      : std.attendance[date] === 'absent'
                        ? 'red'
                        : 'grey-3'
                  "
                  size="sm"
                />
              </td>
              <td
                class="text-center text-weight-bolder bg-grey-1"
                :class="getPercentageColor(std.percentage)"
              >
                {{ std.percentage }}%
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-card>

    <!-- Legend -->
    <div v-if="reportData.length > 0" class="row q-mt-md q-gutter-md justify-center no-print">
      <div class="row items-center">
        <q-icon name="check_circle" color="green" class="q-mr-xs" /> Present
      </div>
      <div class="row items-center">
        <q-icon name="cancel" color="red" class="q-mr-xs" /> Absent
      </div>
      <div class="row items-center">
        <q-icon name="remove" color="grey-3" class="q-mr-xs" /> No Record
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAttendanceStore } from 'src/stores/attendanceStore'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'
import { useUserStore } from 'src/stores/userStore'

const attendanceStore = useAttendanceStore()
const studentStore = useStudentStore()
const classStore = useClassStore()
const userStore = useUserStore()

const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition')

const selectedGrade = ref('')
const selectedSubject = ref('')
const selectedTeacher = ref('')
const selectedMonth = ref(new Date().toISOString().substr(0, 7))
const studentSearch = ref('')
const subjectInput = ref('')

const refreshData = async () => {
  if (userStore.institute?.id) {
    await Promise.all([
      classStore.fetchClasses(),
      studentStore.fetchStudents(),
      attendanceStore.fetchAttendance(),
    ])
  }
}

onMounted(refreshData)

// Watch for institute changes (login/refresh)
watch(
  () => userStore.institute?.id,
  (newVal) => {
    if (newVal) refreshData()
  },
)

const handlePrint = () => {
  window.print()
}

const createSubjectValue = (val, done) => {
  if (val.length > 0) {
    done(val, 'add-unique')
  }
}

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

const filteredSubjectOptions = ref([])

const subjectOptions = computed(() => {
  const subjects = new Set()
  classStore.classes.forEach((c) => {
    // Collect all subjects across all classes
    const sub = c.subject || c.name.split(' (')[0]
    if (sub) subjects.add(sub)
  })
  return Array.from(subjects)
})

function filterSubjects(val, update) {
  update(() => {
    const needle = val.toLowerCase()

    // First, try to get subjects specifically for the selected grade
    const gradeSpecificSubjects = new Set()
    classStore.classes.forEach((c) => {
      if (
        selectedGrade.value &&
        (c.grade === selectedGrade.value || c.name.includes(selectedGrade.value))
      ) {
        const sub = c.subject || c.name.split(' (')[0]
        if (sub) gradeSpecificSubjects.add(sub)
      }
    })

    // If we have grade-specific subjects, use them. Otherwise, show all subjects as suggestions.
    const sourceOptions =
      gradeSpecificSubjects.size > 0 ? Array.from(gradeSpecificSubjects) : subjectOptions.value

    filteredSubjectOptions.value = sourceOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

const filteredTeacherOptions = ref([])
const teacherOptions = computed(() => {
  const teachers = new Set()
  classStore.classes.forEach((c) => {
    if (c.teacher) teachers.add(c.teacher)
  })
  return Array.from(teachers)
})

function filterTeachers(val, update) {
  update(() => {
    const needle = (val || '').toLowerCase()

    // Filter teachers who teach the selected subject/grade if available
    const specificTeachers = new Set()
    classStore.classes.forEach((c) => {
      const matchGrade = !selectedGrade.value || c.grade === selectedGrade.value
      const matchSubject =
        !selectedSubject.value ||
        (c.subject || '').toLowerCase() === selectedSubject.value.toLowerCase()

      if (matchGrade && matchSubject && c.teacher) {
        specificTeachers.add(c.teacher)
      }
    })

    const sourceOptions =
      specificTeachers.size > 0 ? Array.from(specificTeachers) : teacherOptions.value
    filteredTeacherOptions.value = sourceOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

const activeDates = computed(() => {
  if (!selectedGrade.value || !selectedSubject.value || !selectedMonth.value) return []

  const records = attendanceStore.records.filter((r) => {
    // Check month
    const monthMatch = r.date && r.date.startsWith(selectedMonth.value)
    if (!monthMatch) return false

    // Check grade & subject & teacher
    // Note: Store uses .grade, .subject, .teacher fields for custom tracking
    const gMatch = r.grade === selectedGrade.value
    const sMatch = (r.subject || '').toLowerCase() === selectedSubject.value.toLowerCase()
    const tMatch =
      !selectedTeacher.value ||
      (r.teacher || '').toLowerCase() === selectedTeacher.value.toLowerCase()

    return gMatch && sMatch && tMatch
  })

  return Array.from(new Set(records.map((r) => r.date))).sort()
})

const reportData = computed(() => {
  const records = attendanceStore.records.filter((r) => {
    const monthMatch = r.date && r.date.startsWith(selectedMonth.value)
    const gMatch = r.grade === selectedGrade.value
    const sMatch = (r.subject || '').toLowerCase() === selectedSubject.value.toLowerCase()
    const tMatch =
      !selectedTeacher.value ||
      (r.teacher || '').toLowerCase() === selectedTeacher.value.toLowerCase()
    return monthMatch && gMatch && sMatch && tMatch
  })

  const relevantStudents = studentStore.students.filter((s) => {
    // 1. Match Grade (Resilient comparison)
    const sGrade = (s.grade || '').toString().toLowerCase().trim()
    const targetGrade = selectedGrade.value.toLowerCase().trim()

    const gradeMatch = sGrade.includes(targetGrade) || targetGrade.includes(sGrade)
    if (!gradeMatch) return false

    // 2. Match Subject in s.classes
    const studentClasses = Array.isArray(s.classes) ? s.classes : []
    const targetSubject = (selectedSubject.value || subjectInput.value || '').toLowerCase().trim()

    if (!targetSubject) return true // Show all in grade if subject not picked

    return studentClasses.some((sub) => {
      if (!sub) return false
      const normalizedSub = sub.toString().toLowerCase().trim()
      if (normalizedSub === targetSubject) return true

      // Extract numbers to distinguish sessions (Maths 1, Maths 2, etc.)
      const subNums = normalizedSub.match(/\d+/g) || []
      const targetNums = targetSubject.match(/\d+/g) || []

      // If numbers are different, it's a different session
      if (subNums.join(',') !== targetNums.join(',')) return false

      // If numbers match (or no numbers), allow partial includes
      if (normalizedSub.includes(targetSubject) || targetSubject.includes(normalizedSub))
        return true

      // Word-by-word matching for robustness
      const targetWords = targetSubject.split(/\s+/).filter((w) => w.length > 1)
      const subWords = normalizedSub.split(/\s+/)
      return targetWords.every((tw) => subWords.some((sw) => sw.includes(tw)))
    })
  })

  // Apply student name search filter
  const finalFilteredStudents = relevantStudents.filter((s) => {
    if (!studentSearch.value) return true
    return s.name.toLowerCase().includes(studentSearch.value.toLowerCase())
  })

  return finalFilteredStudents
    .map((student) => {
      const studentAttendance = {}
      let presentCount = 0
      let totalRecorded = 0

      activeDates.value.forEach((date) => {
        const dayRecord = records.find((r) => r.date === date)
        const studentStatus = dayRecord
          ? (dayRecord.attendanceList || []).find((d) => d.studentId === student.id)?.status
          : null

        studentAttendance[date] = studentStatus
        if (studentStatus === 'present') presentCount++
        if (studentStatus) totalRecorded++
      })

      const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0

      return {
        ...student,
        attendance: studentAttendance,
        percentage,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
})

const averageAttendance = computed(() => {
  if (reportData.value.length === 0) return 0
  const total = reportData.value.reduce((acc, curr) => acc + curr.percentage, 0)
  return Math.round(total / reportData.value.length)
})

const formatDateMonth = (monthStr) => {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

const getPercentageColor = (pct) => {
  if (pct >= 80) return 'text-green-7'
  if (pct >= 50) return 'text-orange-7'
  return 'text-red-7'
}

watch(selectedGrade, () => {
  selectedSubject.value = ''
  selectedTeacher.value = ''
  studentSearch.value = ''
})

watch(selectedSubject, () => {
  selectedTeacher.value = ''
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}
.report-table {
  max-width: 100%;
}
.sticky-column {
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
  border-right: 1px solid #eee;
}
.date-label {
  font-size: 10px;
  white-space: nowrap;
}
.rotate-th {
  min-width: 40px;
}
</style>

<style>
@media print {
  /* Forcefully hide everything related to navigation, sidebar, and non-report elements */
  .no-print,
  .q-header,
  .q-drawer,
  .q-drawer-container,
  .q-drawer--left,
  .q-btn,
  .q-footer,
  aside,
  header,
  .q-notifications,
  .q-scrollarea__container,
  .q-scrollarea__content {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }

  /* Reset the entire layout for the print page */
  html,
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
  }

  .q-layout {
    min-height: auto !important;
    background: white !important;
    display: block !important;
  }

  /* CRITICAL: Remove all paddings and margins Quasar adds for the sidebar and header */
  .q-page-container {
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  .q-page {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    display: block !important;
  }

  /* Optimize Card for print */
  .modern-card {
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Fix Table Sticky issues for print */
  .sticky-column {
    position: relative !important;
    left: auto !important;
    background: white !important;
    border-right: 2px solid #000 !important;
  }

  /* Force background colors to show in indigo header */
  .bg-indigo-7 {
    background-color: #303f9f !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: white !important;
  }

  .text-white {
    color: white !important;
  }

  /* Ensure table borders are sharp and clear */
  .report-table {
    border-collapse: collapse !important;
    width: 100% !important;
    border: 1px solid #000 !important;
  }

  .report-table th,
  .report-table td {
    border: 1px solid #000 !important;
    padding: 6px !important;
    color: black !important;
    font-size: 11px !important;
  }

  .report-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Icons adjustment */
  .q-icon {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-header-section {
    margin-bottom: 20px !important;
  }
}
</style>
