<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Attendance Tracking</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Mark and monitor student attendance for today
        </p>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn
          color="black"
          label="View Reports"
          icon="analytics"
          unelevated
          rounded
          to="/dashboard/attendance/reports"
          class="q-px-lg"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Session Selector -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders modern-card q-pa-sm">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">Session Details</div>
            <q-form class="q-gutter-y-md">
              <q-select
                v-model="attendanceForm.grade"
                :options="gradeOptions"
                label="Select Grade"
                outlined
                dense
              />
              <q-select
                v-model="attendanceForm.subject"
                :options="subjectOptions"
                label="Subject Name"
                outlined
                dense
                use-input
                input-debounce="0"
                @filter="filterSubjects"
                @input-value="(val) => (subjectInput = val)"
                @blur="handleSubjectBlur"
                new-value-mode="add-unique"
                placeholder="Type or select subject"
                hint="Tip: Type 'Science' if it's misspelled in your list"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Press Enter to use "{{ subjectInput }}"
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-select
                v-model="attendanceForm.teacher"
                :options="teacherOptions"
                label="Teacher Name"
                outlined
                dense
                use-input
                input-debounce="0"
                @filter="filterTeachers"
                placeholder="Select or type teacher name"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> No teachers found </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model="selectedDate" label="Date" outlined dense type="date" />

              <q-btn
                label="Load Student List"
                color="black"
                unelevated
                rounded
                class="full-width q-py-sm shadow-1"
                @click="loadStudents"
                :disable="
                  !attendanceForm.grade ||
                  (!attendanceForm.subject && !subjectInput) ||
                  !attendanceForm.teacher
                "
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Attendance List -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders modern-card">
          <div v-if="!sessionLoaded" class="q-pa-xl text-center">
            <q-icon name="fact_check" size="100px" color="grey-3" />
            <div class="text-h6 text-grey-5 q-mt-md">
              Choose a class and click "Load" to start marking attendance
            </div>
          </div>

          <div v-else>
            <q-card-section class="row items-center justify-between">
              <div class="row items-center">
                <div class="q-mr-md">
                  <div class="text-h6 text-weight-bold">
                    {{ attendanceForm.subject || subjectInput }} - {{ attendanceForm.grade }}
                    <span
                      class="text-weight-medium text-grey-7 q-ml-sm"
                      v-if="attendanceForm.teacher"
                    >
                      ({{ attendanceForm.teacher }})
                    </span>
                    <q-badge
                      v-if="isHistory"
                      color="indigo"
                      label="HISTORY"
                      class="q-ml-sm shadow-1"
                    />
                  </div>
                  <div class="text-caption text-grey-7">
                    <span v-if="isHistory">Showing saved record for {{ selectedDate }}</span>
                    <span v-else
                      >{{ studentAttendanceList.length }} Students Matched for Academic Group</span
                    >
                  </div>
                </div>
                <q-toggle
                  v-model="showAllStudents"
                  label="Show All Students"
                  color="indigo"
                  dense
                  class="text-caption text-weight-bold"
                  @update:model-value="loadStudents"
                />
              </div>
              <div class="row q-gutter-sm">
                <!-- Smart Scan Button -->
                <q-btn
                  unelevated
                  rounded
                  color="indigo"
                  icon="qr_code_scanner"
                  label="Smart Scan"
                  @click="startScanner"
                  class="shadow-2"
                >
                  <q-tooltip class="bg-indigo">Use Camera to Scan ID Cards</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  color="green"
                  label="Mark All Present"
                  no-caps
                  @click="markAll('present')"
                />
                <q-btn
                  flat
                  color="red"
                  label="Mark All Absent"
                  no-caps
                  @click="markAll('absent')"
                />
              </div>
            </q-card-section>

            <q-separator />

            <div class="q-pa-sm bg-grey-1">
              <q-input
                v-model="listFilter"
                placeholder="Search students in this list..."
                dense
                outlined
                rounded
                bg-color="white"
                class="q-mx-md q-my-xs"
              >
                <template v-slot:prepend><q-icon name="search" size="xs" /></template>
              </q-input>
            </div>

            <q-separator />

            <!-- Student List -->
            <q-list separator>
              <q-item
                v-for="std in filteredAttendanceList"
                :key="std.id"
                class="q-py-md transition-all"
                :class="{ 'bg-green-1': std.justScanned }"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="`https://api.dicebear.com/7.x/initials/svg?seed=${std.name}`" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle1">{{
                    std.name
                  }}</q-item-label>
                  <q-item-label caption>
                    <span class="text-indigo text-weight-bold">{{ std.id_number }}</span> •
                    {{ std.grade }}
                  </q-item-label>
                  <div class="row q-gutter-xs q-mt-xs">
                    <q-badge
                      v-for="sub in std.classes"
                      :key="sub"
                      color="grey-2"
                      text-color="grey-7"
                      size="sm"
                    >
                      {{ sub }}
                    </q-badge>
                  </div>
                </q-item-section>

                <q-item-section side>
                  <div class="row no-wrap q-gutter-x-sm">
                    <q-btn
                      label="Absent"
                      unelevated
                      rounded
                      no-caps
                      :color="std.status === 'absent' ? 'red' : 'grey-2'"
                      :text-color="std.status === 'absent' ? 'white' : 'grey-9'"
                      @click="std.status = 'absent'"
                      class="q-px-md text-weight-bold"
                    />
                    <q-btn
                      label="Present"
                      unelevated
                      rounded
                      no-caps
                      :color="std.status === 'present' ? 'green' : 'grey-2'"
                      :text-color="std.status === 'present' ? 'white' : 'grey-9'"
                      @click="std.status = 'present'"
                      class="q-px-md text-weight-bold"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <div
                v-if="studentAttendanceList.length === 0"
                class="q-pa-xl text-center text-grey-6"
              >
                No students enrolled in this class yet.
              </div>
            </q-list>

            <q-card-actions align="right" class="q-pa-md bg-grey-1">
              <q-btn
                label="Save Attendance Record"
                color="green-7"
                unelevated
                rounded
                class="q-px-xl text-weight-bold"
                @click="saveAttendance"
                :loading="saving"
              />
            </q-card-actions>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Scanner Dialog -->
    <q-dialog
      v-model="showScannerDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 400px; max-width: 90vw" class="bg-black text-white">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Scanner Active</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="stopScanner" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div
            class="rounded-borders overflow-hidden bg-grey-9 relative-position flex flex-center"
            style="min-height: 300px"
          >
            <div id="qr-reader" style="width: 100%"></div>
            <div v-if="scannerLoading" class="absolute-center text-center">
              <q-spinner size="3em" color="indigo" />
              <div class="q-mt-sm text-caption">Starting Camera...</div>
            </div>
          </div>
          <div class="q-mt-md text-center text-grey-5">Point camera at student ID card QR Code</div>
          <div class="q-mt-sm text-center text-caption text-grey-7">
            Scanning will check for Student ID Match automatically
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useClassStore } from 'src/stores/classStore'
import { useStudentStore } from 'src/stores/studentStore'
import { useAttendanceStore } from 'src/stores/attendanceStore'
import { Html5Qrcode } from 'html5-qrcode'

const $q = useQuasar()
const classStore = useClassStore()
const studentStore = useStudentStore()
const attendanceStore = useAttendanceStore()

const attendanceForm = ref({
  grade: '',
  subject: '',
  teacher: '',
})
const selectedDate = ref(new Date().toISOString().substr(0, 10))
const sessionLoaded = ref(false)
const saving = ref(false)
const showAllStudents = ref(false)
const listFilter = ref('')
const subjectInput = ref('')
const isHistory = ref(false)
const studentAttendanceList = ref([])

// Scanner State
const showScannerDialog = ref(false)
const scannerLoading = ref(false)
let html5QrCode = null

onMounted(async () => {
  await studentStore.fetchStudents()
  await classStore.fetchClasses()
  await attendanceStore.fetchAttendance()
})

onBeforeUnmount(() => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch((err) => console.error(err))
  }
})

// --- Scanner Logic ---
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = 880 // A5 - High beep
    gain.gain.value = 0.1

    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 150)
  } catch (e) {
    console.warn('Audio play failed', e)
  }
}

const startScanner = async () => {
  // Ensure lists are loaded
  if (!sessionLoaded.value) {
    $q.notify({
      type: 'warning',
      message: 'Please load a student list first.',
    })
    return
  }

  showScannerDialog.value = true
  scannerLoading.value = true

  await nextTick()

  // Give DOM a moment to render the div
  setTimeout(() => {
    // Check if element exists
    if (!document.getElementById('qr-reader')) {
      console.error('QR Reader element not found')
      return
    }

    html5QrCode = new Html5Qrcode('qr-reader')
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    // Try to find environment camera (back camera)
    html5QrCode
      .start({ facingMode: 'environment' }, config, onScanSuccess)
      .then(() => {
        scannerLoading.value = false
      })
      .catch((err) => {
        console.error('Camera start error', err)
        scannerLoading.value = false
        $q.notify({
          type: 'negative',
          message:
            'Failed to start camera. Please ensure camera permissions are allowed. Error: ' + err,
          timeout: 5000,
        })
        showScannerDialog.value = false
      })
  }, 500)
}

const stopScanner = () => {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        html5QrCode.clear()
        showScannerDialog.value = false
      })
      .catch((err) => {
        console.error(err)
        showScannerDialog.value = false
      })
  } else {
    showScannerDialog.value = false
  }
}

const onScanSuccess = (decodedText) => {
  console.log('Scanned:', decodedText)
  // Debounce logic could be added here if needed, but for now exact match checking prevents spamming slightly

  // Format of text is likely just the ID: "ST-0004"
  // Clean whitespace just in case
  const cleanId = decodedText.trim().toUpperCase()

  const student = studentAttendanceList.value.find((s) => s.id_number.toUpperCase() === cleanId)

  if (student) {
    if (student.status !== 'present') {
      student.status = 'present'
      student.justScanned = true // Add visual flair
      playBeep()

      $q.notify({
        type: 'positive',
        message: `Marked Present: ${student.name}`,
        position: 'top',
        timeout: 2000,
        icon: 'check_circle',
      })

      // Remove highlight after animation
      setTimeout(() => {
        student.justScanned = false
      }, 3000)
    } else {
      // Already marked - optional feedback to let user know scan worked but action wasn't needed
      $q.notify({
        group: 'scan-feedback', // grouping notifications prevents stackup
        type: 'info',
        message: `Already marked: ${student.name}`,
        position: 'top',
        timeout: 1000,
      })
    }
  } else {
    $q.notify({
      group: 'scan-feedback',
      type: 'warning',
      message: `Student ID "${cleanId}" not found in this filtered class list!`,
      position: 'top',
      timeout: 3000,
    })
  }
}

// --- Standard Logic ---

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

// Extract unique subjects from classStore for suggestions
const subjectOptions = ref([])
const allSubjects = computed(() => {
  const subjects = new Set()
  classStore.classes.forEach((c) => subjects.add(c.subject))
  return Array.from(subjects)
})

function filterSubjects(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    subjectOptions.value = allSubjects.value.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

// Extract unique teachers for suggestions
const teacherOptions = ref([])
const allTeachers = computed(() => {
  const teachers = new Set()
  classStore.classes.forEach((c) => {
    if (c.teacher) teachers.add(c.teacher)
  })
  return Array.from(teachers)
})

function filterTeachers(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    teacherOptions.value = allTeachers.value.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

const handleSubjectBlur = () => {
  // Auto-correction for the common typo noticed
  if (subjectInput.value) {
    let corrected = subjectInput.value.trim()
    if (corrected.toLowerCase() === 'sceince') {
      corrected = 'Science'
      $q.notify({
        message: 'Auto-corrected "Sceince" to "Science"',
        color: 'indigo',
        icon: 'auto_fix_high',
        position: 'top',
        timeout: 2000,
      })
    }

    // Assign if model is empty but we have input
    if (!attendanceForm.value.subject) {
      attendanceForm.value.subject = corrected
    }
  }
}

const currentClassName = computed(() => {
  const sub = attendanceForm.value.subject || subjectInput.value
  const teacherStr = attendanceForm.value.teacher ? ` - ${attendanceForm.value.teacher}` : ''
  return `${sub} (${attendanceForm.value.grade})${teacherStr}`
})

const filteredAttendanceList = computed(() => {
  if (!listFilter.value) return studentAttendanceList.value
  const f = listFilter.value.toLowerCase()
  return studentAttendanceList.value.filter(
    (s) => s.name.toLowerCase().includes(f) || s.id_number.toLowerCase().includes(f),
  )
})

const loadStudents = () => {
  const finalSubject = attendanceForm.value.subject || subjectInput.value
  if (!attendanceForm.value.grade || !finalSubject) {
    $q.notify({ type: 'warning', message: 'Please select Grade and Subject first.' })
    return
  }

  // Define identifiers for history lookup
  const classId = `${finalSubject}-${attendanceForm.value.grade}`
  const existingRecord = attendanceStore.getRecord(
    classId,
    selectedDate.value,
    attendanceForm.value.teacher,
  )
  isHistory.value = !!existingRecord

  // Update the form subject if we only have typed input
  if (!attendanceForm.value.subject && subjectInput.value) {
    attendanceForm.value.subject = subjectInput.value
  }

  let students = []

  if (showAllStudents.value) {
    // Show everyone in the system
    students = studentStore.students
  } else {
    // Dynamic Filtered Logic based on Grade and Subject
    const normalizedTarget = finalSubject.toLowerCase().trim()

    students = studentStore.students.filter((s) => {
      const sameGrade = s.grade === attendanceForm.value.grade
      if (!sameGrade) return false

      if (!s.classes || !Array.isArray(s.classes)) return false

      // Match Subject with session number awareness (e.g., Maths vs Maths 2)
      return s.classes.some((sub) => {
        const normalizedSub = sub.toLowerCase().trim()
        if (normalizedSub === normalizedTarget) return true

        // Extract numbers to distinguish sessions (Maths 1, Maths 2, etc.)
        const subNums = normalizedSub.match(/\d+/g) || []
        const targetNums = normalizedTarget.match(/\d+/g) || []

        // If numbers are different, it's a different session
        if (subNums.join(',') !== targetNums.join(',')) return false

        // If numbers match (or no numbers), allow partial includes
        if (normalizedSub.includes(normalizedTarget) || normalizedTarget.includes(normalizedSub))
          return true

        // Word-by-word matching for robustness (handles "Science Grade 10" vs "Science")
        const targetWords = normalizedTarget.split(/\s+/).filter((w) => w.length > 1)
        const subWords = normalizedSub.split(/\s+/)
        return targetWords.every((tw) => subWords.some((sw) => sw.includes(tw)))
      })
    })

    // If no students found for subject, but they exist for grade, notify the user
    if (students.length === 0) {
      const gradeStudents = studentStore.students.filter(
        (s) => s.grade === attendanceForm.value.grade,
      )
      if (gradeStudents.length > 0) {
        $q.notify({
          type: 'warning',
          message: `No students found for "${finalSubject}" in ${attendanceForm.value.grade}. ${gradeStudents.length} students exist in this grade. Check subject spelling or use "Show All Students".`,
          duration: 10000,
          position: 'top',
          actions: [
            {
              label: 'Show All',
              color: 'white',
              handler: () => {
                showAllStudents.value = true
                loadStudents()
              },
            },
          ],
        })
      }
    }
  }

  studentAttendanceList.value = students.map((s) => {
    // If it's history, find the student's status in the saved data
    let status = 'present'
    if (existingRecord) {
      const savedStd = (existingRecord.attendanceList || []).find((d) => d.studentId === s.id)
      if (savedStd) status = savedStd.status
    }

    return {
      ...s,
      status: status,
      justScanned: false,
    }
  })

  if (isHistory.value) {
    $q.notify({
      icon: 'history',
      color: 'indigo',
      message: `Loaded record from ${selectedDate.value}`,
      position: 'bottom',
    })
  }

  sessionLoaded.value = true
}

const markAll = (status) => {
  studentAttendanceList.value.forEach((s) => (s.status = status))
}

const saveAttendance = async () => {
  saving.value = true
  try {
    const list = studentAttendanceList.value.map((s) => ({
      studentId: s.id,
      status: s.status,
    }))

    const finalSubject = attendanceForm.value.subject || subjectInput.value
    await attendanceStore.markAttendance(
      `${finalSubject}-${attendanceForm.value.grade}`,
      selectedDate.value,
      list,
      attendanceForm.value.grade,
      finalSubject,
      attendanceForm.value.teacher,
    )

    $q.notify({
      type: 'positive',
      message: `Attendance for ${currentClassName.value} saved successfully!`,
      position: 'top',
    })

    sessionLoaded.value = false
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to save attendance record.',
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}
.transition-all {
  transition: all 0.3s ease;
}
</style>
