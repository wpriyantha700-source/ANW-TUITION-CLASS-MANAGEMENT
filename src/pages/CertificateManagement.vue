<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Academic Certificates</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Issue and manage official achievement certificates
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="black"
          icon="auto_awesome"
          label="Issue New Certificate"
          rounded
          unelevated
          @click="showIssueDialog = true"
          class="q-px-lg shadow-2"
        />
      </div>
    </div>

    <!-- Stats summary -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders text-center q-pa-md modern-card">
          <q-icon :name="stat.icon" :color="stat.color" size="lg" />
          <div class="text-h4 text-weight-bold q-mt-sm">{{ stat.value }}</div>
          <div class="text-caption text-grey-6 text-uppercase letter-spacing-1">
            {{ stat.label }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- Recent Certificates Table -->
    <q-card flat bordered class="rounded-borders modern-card">
      <q-table
        title="Recently Issued Certificates"
        :rows="issuedCerts"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Search by student..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-template="props">
          <q-td :props="props">
            <q-badge :color="getTemplateColor(props.value)" class="text-weight-bold">
              {{ getTemplateName(props.value) }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="indigo" icon="visibility" @click="viewCert(props.row)">
              <q-tooltip>Preview Certificate</q-tooltip>
            </q-btn>
            <q-btn flat round color="black" icon="print" @click="printCert(props.row)">
              <q-tooltip>Direct Print</q-tooltip>
            </q-btn>
            <q-btn flat round color="red" icon="delete_outline" @click="confirmDelete(props.row)">
              <q-tooltip>Delete Record</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Issue Certificate Dialog -->
    <q-dialog v-model="showIssueDialog">
      <q-card style="width: 500px; border-radius: 20px" class="q-pa-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold text-grey-9">Issue Certificate</div>
          <div class="text-caption text-grey-6">Select student and template to generate</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-select
            v-model="newCert.studentId"
            :options="studentOptions"
            label="Select Student"
            outlined
            dense
            option-label="name"
            option-value="id"
            emit-value
            map-options
            use-input
            @filter="filterStudents"
          />
          <q-select
            v-model="newCert.templateId"
            :options="templates"
            label="Certificate Template"
            outlined
            dense
            option-label="name"
            option-value="id"
            emit-value
            map-options
          />
          <q-select
            v-if="newCert.templateId === 'exam_result'"
            v-model="newCert.examId"
            :options="examOptions"
            label="Select Exam Source"
            outlined
            dense
            option-label="title"
            option-value="id"
            emit-value
            map-options
            hint="Automatically loads marks and grade for the student"
          />
          <q-input
            v-model="newCert.reason"
            label="Award Reason / Field of Study"
            outlined
            dense
            placeholder="e.g. Mathematics Proficiency, Grade 10 Completion"
          />
          <div
            v-if="newCert.templateId === 'exam_result' && autoFetchedData"
            class="row q-col-gutter-sm"
          >
            <div class="col-6">
              <q-input
                v-model="autoFetchedData.marks"
                label="Marks"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="autoFetchedData.grade"
                label="Grade"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
          </div>
          <q-input
            v-model="newCert.extraNote"
            label="Internal Notes (Optional)"
            outlined
            dense
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right" class="q-mt-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            label="Generate & Issue"
            color="black"
            unelevated
            rounded
            class="q-px-lg"
            @click="handleIssue"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreview">
      <q-card class="certificate-preview-card" style="width: 800px; max-width: 95vw">
        <q-card-section class="q-pa-none relative-position">
          <!-- Professional Certificate UI Mockup -->
          <div
            class="cert-frame q-pa-xl text-center"
            :style="`border: 20px solid var(--q-${getTemplateColor(selectedCert?.templateId)})`"
          >
            <div class="cert-body q-pa-xl bg-white border-gold shadow-10">
              <div class="row justify-center q-mb-md" v-if="instituteLogo">
                <q-avatar size="60px">
                  <img :src="instituteLogo" />
                </q-avatar>
              </div>
              <div class="text-caption text-indigo-7 text-weight-bold q-mb-xs">
                {{ instituteName }}
              </div>
              <div
                class="cert-header uppercase letter-spacing-2 text-weight-bolder text-h5 q-mb-xl"
              >
                Certificate of Achievement
              </div>
              <div class="cert-text text-subtitle1 italic q-mb-md text-grey-8">
                This is to certify that
              </div>
              <div class="cert-name text-h3 text-weight-bolder q-mb-md text-indigo-9 serif-font">
                {{ selectedCert?.studentName }}
              </div>
              <div class="cert-text text-subtitle1 q-mb-xl text-grey-8">
                has successfully demonstrated excellence in
              </div>
              <div class="cert-reason text-h5 text-weight-bold q-mb-xl text-grey-9">
                {{ selectedCert?.reason }}
              </div>

              <!-- Exam Results Display -->
              <div
                v-if="selectedCert?.templateId === 'exam_result'"
                class="row justify-center q-mb-xl"
              >
                <div
                  class="col-auto q-px-xl q-py-md bg-grey-1 rounded-borders border-gold row items-center no-wrap"
                >
                  <div class="q-mr-lg">
                    <div class="text-caption text-grey-7 text-uppercase">Score</div>
                    <div class="text-h3 text-weight-bolder text-deep-orange">
                      {{ selectedCert?.marks }}
                    </div>
                  </div>
                  <q-separator vertical inset class="q-mx-md" />
                  <div class="q-ml-lg text-center">
                    <div class="text-caption text-grey-7 text-uppercase">Grade</div>
                    <q-badge
                      :color="getGradeColor(selectedCert?.grade)"
                      class="text-h3 q-pa-md text-weight-bolder"
                    >
                      {{ selectedCert?.grade }}
                    </q-badge>
                  </div>
                </div>
              </div>

              <div class="row justify-around q-mt-xl">
                <div class="col-4 border-top-grey q-pt-md">
                  <div class="text-caption text-grey-7">Issued Date</div>
                  <div class="text-weight-bold">{{ formatDate(selectedCert?.issuedDate) }}</div>
                </div>
                <div class="col-2">
                  <q-icon name="stars" color="amber-8" size="70px" class="shadow-1 circle-badge" />
                </div>
                <div class="col-4 border-top-grey q-pt-md">
                  <div class="text-caption text-grey-7">Authorized Signature</div>
                  <div class="text-weight-bold q-mt-sm">{{ instituteName }} Management</div>
                  <div class="signature-font text-h6"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="absolute-top-right q-pa-md no-print">
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pb-lg no-print">
          <q-btn
            label="Download PDF"
            icon="download"
            flat
            color="primary"
            @click="downloadPDF"
            :loading="downloading"
          />
          <q-btn
            label="Print Certificate"
            icon="print"
            color="black"
            unelevated
            rounded
            @click="printCurrent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useCertificateStore } from 'src/stores/certificateStore'
import { useStudentStore } from 'src/stores/studentStore'
import { useExamStore } from 'src/stores/examStore'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const certStore = useCertificateStore()
const studentStore = useStudentStore()
const examStore = useExamStore()
const userStore = useUserStore()

const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition')
const instituteLogo = computed(() => userStore.institute?.logo_url || '')

const showIssueDialog = ref(false)
const showPreview = ref(false)
const downloading = ref(false)
const selectedCert = ref(null)
const filter = ref('')
const studentFilterValue = ref('')

const issuedCerts = computed(() => certStore.issuedCertificates)
const templates = computed(() => certStore.templates)

const stats = computed(() => [
  {
    label: 'Total Issued',
    value: issuedCerts.value.length,
    icon: 'military_tech',
    color: 'indigo',
  },
  {
    label: 'Standard',
    value: issuedCerts.value.filter((c) => c.templateId === 'standard').length,
    icon: 'workspace_premium',
    color: 'blue',
  },
  {
    label: 'Honor Roll',
    value: issuedCerts.value.filter((c) => c.templateId === 'honor').length,
    icon: 'emoji_events',
    color: 'amber',
  },
  {
    label: 'Completion',
    value: issuedCerts.value.filter((c) => c.templateId === 'completion').length,
    icon: 'auto_stories',
    color: 'emerald',
  },
  {
    label: 'Results Report',
    value: issuedCerts.value.filter((c) => c.templateId === 'exam_result').length,
    icon: 'assignment_turned_in',
    color: 'deep-orange',
  },
])

const examOptions = computed(() => examStore.exams)

// Watch for student/exam changes to auto-fetch result data
const autoFetchedData = computed(() => {
  if (newCert.templateId !== 'exam_result' || !newCert.studentId || !newCert.examId) return null
  const exam = examStore.exams.find((e) => e.id === newCert.examId)
  if (!exam) return null
  const result = exam.results?.find((r) => r.studentId === newCert.studentId)
  return result || { marks: 'N/A', grade: '-' }
})

const studentOptions = computed(() => {
  const filtered = studentStore.students.filter((s) =>
    s.name.toLowerCase().includes(studentFilterValue.value.toLowerCase()),
  )
  return filtered
})

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'studentName', label: 'Student', align: 'left', field: 'studentName', sortable: true },
  { name: 'template', label: 'Template Type', align: 'left', field: 'templateId' },
  { name: 'reason', label: 'Award Reason', align: 'left', field: 'reason' },
  {
    name: 'issuedDate',
    label: 'Date',
    align: 'left',
    field: 'issuedDate',
    format: (val) => new Date(val).toLocaleDateString(),
  },
  { name: 'actions', label: 'Actions', align: 'center' },
]

const newCert = reactive({
  studentId: null,
  templateId: 'standard',
  examId: null,
  reason: '',
  extraNote: '',
})

const filterStudents = (val, update) => {
  update(() => (studentFilterValue.value = val))
}

const getTemplateName = (id) => templates.value.find((t) => t.id === id)?.name || 'Standard'
const getTemplateColor = (id) => templates.value.find((t) => t.id === id)?.color || 'indigo'

const handleIssue = () => {
  if (!newCert.studentId || !newCert.reason) {
    $q.notify({ color: 'negative', message: 'Please select student and award reason' })
    return
  }

  const student = studentStore.students.find((s) => s.id === newCert.studentId)

  certStore.issueCertificate({
    ...newCert,
    studentName: student.name,
    marks: autoFetchedData.value?.marks || null,
    grade: autoFetchedData.value?.grade || null,
  })

  $q.notify({ type: 'positive', message: 'Certificate issued successfully!', icon: 'verified' })
  showIssueDialog.value = false

  // Reset
  newCert.studentId = null
  newCert.reason = ''
}

const viewCert = (cert) => {
  selectedCert.value = cert
  showPreview.value = true
}

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

const printCert = (cert) => {
  selectedCert.value = cert
  showPreview.value = true
  // Wait for dialog to open before printing
  setTimeout(() => {
    printCurrent()
  }, 500)
}

const printCurrent = () => {
  window.print()
}

const confirmDelete = (cert) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the certificate for <b>${cert.studentName}</b>? This action cannot be undone.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Delete',
      flat: true,
    },
  }).onOk(() => {
    certStore.deleteCertificate(cert.id)
    $q.notify({
      type: 'positive',
      message: 'Certificate deleted successfully',
      icon: 'delete',
    })
  })
}

const downloadPDF = () => {
  downloading.value = true

  // Use a slight delay to ensure UI is stable
  setTimeout(() => {
    const element = document.querySelector('.cert-frame')

    if (!window.html2pdf) {
      downloading.value = false
      $q.notify({
        type: 'negative',
        message: 'PDF Library not loaded. Please refresh the page.',
      })
      return
    }

    const opt = {
      margin: 0.2,
      filename: `Certificate_${selectedCert.value.studentName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
    }

    window
      .html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        downloading.value = false
        $q.notify({
          type: 'positive',
          message: 'Certificate downloaded successfully!',
          icon: 'check_circle',
        })
      })
      .catch((err) => {
        console.error(err)
        downloading.value = false
        $q.notify({
          type: 'negative',
          message: 'Failed to generate PDF.',
          icon: 'error',
        })
      })
  }, 500)
}

const getGradeColor = (grade) => {
  const colors = { A: 'green', B: 'light-green', C: 'amber', S: 'orange', F: 'red', '-': 'grey-6' }
  return colors[grade] || 'grey'
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}

.cert-frame {
  background: #fdfdfd;
}

.cert-body {
  border: 1px solid #d4af37;
  min-height: 500px;
  background-image: radial-gradient(#f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
}

.border-gold {
  border: 2px solid #d4af37;
}
.border-top-grey {
  border-top: 1px solid #ccc;
}
.circle-badge {
  border: 4px solid #fff;
  border-radius: 50%;
  padding: 5px;
}

.serif-font {
  font-family: 'Times New Roman', serif;
}
.signature-font {
  font-family: 'Brush Script MT', cursive;
}

@media print {
  /* Hide the main app container and specific Quasar layout elements */
  body > :not(.q-dialog),
  .q-header,
  .q-drawer,
  .q-footer,
  .q-page-container {
    display: none !important;
  }

  /* Reset body visibility but ensure background is white */
  body {
    visibility: visible !important;
    background: white !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Ensure the dialog wrapper is visible and fullscreen */
  .q-dialog,
  .q-dialog__inner {
    display: block !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    background: white !important;
    visibility: visible !important;
  }

  /* Hide the dim backdrop */
  .q-dialog__backdrop {
    display: none !important;
  }

  /* Style the Certificate Card */
  .certificate-preview-card {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    box-shadow: none !important;
    max-width: none !important;
    background: white !important;
    visibility: visible !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }

  /* Certificate Content Layout for Portrait */
  .cert-frame {
    border: none !important; /* Remove outer frame border to save space */
    padding: 0 !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .cert-body {
    width: 90% !important;
    min-height: 85% !important; /* Use percentage to fill A4 nicely */
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-evenly !important; /* Distribute space vertically */
    margin: auto !important;
    border: 4px solid #d4af37 !important; /* Thicker border for better look */
    background-size: 20px 20px !important;
  }

  /* Adjust internal spacing */
  .cert-header {
    margin-bottom: 2rem !important;
  }
  .cert-name {
    margin-bottom: 2rem !important;
    font-size: 3rem !important;
  }
  .cert-text {
    margin-bottom: 1.5rem !important;
  }

  /* Hide UI buttons */
  .no-print {
    display: none !important;
  }

  @page {
    size: portrait;
    margin: 0mm; /* Use 0 margin to let custom CSS handle padding */
  }
}
</style>
