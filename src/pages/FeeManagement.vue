<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Fee Collection</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">Manage student payments and issue receipts</p>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn
          unelevated
          color="black"
          text-color="white"
          icon="payments"
          label="Record New Payment"
          rounded
          @click="showPaymentDialog = true"
        />
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section>
            <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
              Total Collection
            </div>
            <div class="text-h5 text-weight-bolder">
              Rs. {{ paymentStore.totalRevenue.toLocaleString() }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section>
            <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
              Pending This Month
            </div>
            <div class="text-h5 text-weight-bolder text-orange">
              {{ pendingPayments.length }} Students
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="rounded-borders bg-white">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="history" label="Payment History" icon="history" />
        <q-tab name="pending" label="Incomplete / Pending" icon="assignment_late" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- History Tab -->
        <q-tab-panel name="history" class="q-pa-none">
          <q-table
            :rows="paymentStore.payments"
            :columns="columns"
            row-key="id"
            flat
            :filter="filter"
          >
            <template v-slot:top>
              <div class="text-h6 q-px-md q-py-sm">Recent Transactions</div>
              <q-space />
              <q-input
                borderless
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search Receipts..."
                class="q-px-md"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                <div class="text-weight-bold text-green-7">
                  Rs. {{ props.value.toLocaleString() }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn
                  flat
                  round
                  color="grey-7"
                  icon="print"
                  size="sm"
                  @click="printReceipt(props.row)"
                >
                  <q-tooltip>Print Receipt</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="red-7"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Delete Record</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Pending Tab -->
        <q-tab-panel name="pending" class="q-pa-md">
          <div class="row items-center q-mb-md q-col-gutter-md">
            <div class="col-12 col-md-auto text-subtitle1 text-weight-bold text-grey-8">
              Pending Payments for:
            </div>
            <div class="col-6 col-sm-3 col-md-2">
              <q-select
                v-model="selectedMonth"
                :options="months"
                outlined
                dense
                label="Month"
                bg-color="white"
              />
            </div>
            <div class="col-6 col-sm-3 col-md-2">
              <q-input
                v-model.number="selectedYear"
                outlined
                dense
                label="Year"
                type="number"
                bg-color="white"
              />
            </div>
            <q-space />
            <div class="col-12 col-sm-4">
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pendingFilter"
                placeholder="Search Pending..."
                bg-color="white"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <q-table
            :rows="pendingPayments"
            :columns="pendingColumns"
            row-key="id"
            flat
            bordered
            :filter="pendingFilter"
            class="shadow-1"
          >
            <template v-slot:body-cell-studentName="props">
              <q-td :props="props">
                <div class="text-weight-bold">{{ props.row.studentName }}</div>
                <div class="text-caption text-grey-6">{{ props.row.studentId }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge color="orange-1" text-color="orange-9" class="q-px-sm q-py-xs">
                  <q-icon name="warning" size="xs" class="q-mr-xs" />
                  Due / Unpaid
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="right">
                <q-btn
                  unelevated
                  rounded
                  color="indigo"
                  size="sm"
                  label="Collect"
                  icon="payments"
                  @click="openPaymentForStudent(props.row)"
                />
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey-8 q-pa-md">
                <q-icon size="2em" name="check_circle" color="green" class="q-mr-sm" />
                <span>All clear! No pending payments found for this period.</span>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Initial Payment Dialog -->
    <q-dialog v-model="showPaymentDialog" persistent>
      <q-card style="min-width: 450px; border-radius: 20px" class="q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">New Fee Payment</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="submitPayment" class="q-gutter-y-md">
            <!-- Student Selection -->
            <q-select
              v-model="selectedStudent"
              :options="studentOptions"
              label="Select Student"
              outlined
              dense
              use-input
              @filter="filterStudents"
              option-label="name"
              hint="Type student name or ID"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" class="q-py-sm">
                  <q-item-section avatar>
                    <q-avatar size="32px"
                      ><img
                        :src="`https://api.dicebear.com/7.x/initials/svg?seed=${scope.opt.name}`"
                    /></q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption
                      >{{ scope.opt.id_number }} • {{ scope.opt.grade }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Class Selection -->
            <q-select
              v-model="selectedClass"
              :use-input="true"
              :options="classOptions"
              label="Select Class/Subject"
              outlined
              dense
              :disable="!selectedStudent"
              option-label="name"
              @filter="filterClasses"
              new-value-mode="add-unique"
              hint="Select from list or type custom subject"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Press Enter to use custom subject
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Month Selection -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select
                  v-model="paymentForm.month"
                  :options="months"
                  label="For Month"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="paymentForm.year"
                  label="Year"
                  outlined
                  dense
                  type="number"
                />
              </div>
            </div>

            <!-- Amount -->
            <q-input
              v-model.number="paymentForm.amount"
              label="Amount (Rs.)"
              outlined
              dense
              type="number"
              prefix="Rs."
              class="text-weight-bold text-h6"
            />

            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancel" v-close-popup color="grey-7" no-caps @click="resetForm" />
              <q-btn
                unelevated
                label="Confirm Payment & Print"
                type="submit"
                color="green-7"
                rounded
                class="q-px-lg shadow-2"
                no-caps
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Simple Receipt Preview Dialog -->
    <q-dialog v-model="receiptDialog">
      <q-card style="width: 350px; border-radius: 12px" class="q-pa-md receipt-card">
        <div class="text-center q-mb-md">
          <div class="text-h6 text-weight-bold uppercase">{{ instituteName }}</div>
          <div class="text-caption text-grey-7">Official Payment Receipt</div>
        </div>
        <q-separator color="black" class="q-mb-md" />

        <div v-if="activeReceipt" class="q-gutter-y-xs text-subtitle2">
          <div class="row justify-between">
            <span>Receipt No:</span
            ><span class="text-weight-bold">{{ activeReceipt.receiptNo }}</span>
          </div>
          <div class="row justify-between">
            <span>Date:</span><span>{{ activeReceipt.date }}</span>
          </div>
          <q-separator dashed class="q-my-sm" />
          <div class="text-weight-bold q-mb-xs">{{ activeReceipt.studentName }}</div>
          <div class="row justify-between text-caption">
            <span>Class:</span><span>{{ activeReceipt.className }}</span>
          </div>
          <div class="row justify-between text-caption">
            <span>Month:</span><span>{{ activeReceipt.month }} {{ activeReceipt.year }}</span>
          </div>
          <q-separator dashed class="q-my-sm" />
          <div class="row justify-between text-h6 text-weight-bolder">
            <span>Total Paid:</span><span>Rs. {{ activeReceipt.amount }}</span>
          </div>
        </div>

        <div class="text-center text-caption text-grey-6 q-mt-lg">Thank You!</div>
        <q-card-actions align="center" class="q-mt-md no-print">
          <q-btn
            unelevated
            color="black"
            label="Print Receipt"
            icon="print"
            rounded
            class="full-width"
            @click="handlePrint"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'
import { usePaymentStore } from 'src/stores/paymentStore'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const route = useRoute()
const studentStore = useStudentStore()
const classStore = useClassStore()
const paymentStore = usePaymentStore()
const userStore = useUserStore()

const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition Center')

// Tabs
const activeTab = ref('history')
const filter = ref('')
const pendingFilter = ref('')

// Dialogs
const showPaymentDialog = ref(false)
const receiptDialog = ref(false)
const activeReceipt = ref(null)

// Form State
const selectedStudent = ref(null)
const selectedClass = ref(null)
const studentOptions = ref([])
const classOptions = ref([])

// Pending Data Filters
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const selectedMonth = ref(months[new Date().getMonth()])
const selectedYear = ref(new Date().getFullYear())

const paymentForm = ref({
  month: months[new Date().getMonth()],
  year: new Date().getFullYear(),
  amount: 0,
})

onMounted(async () => {
  await studentStore.fetchStudents()
  await classStore.fetchClasses()
  await paymentStore.fetchPayments()

  studentOptions.value = studentStore.students

  if (route.query.tab === 'pending') {
    activeTab.value = 'pending'
  }
})

// --- Columns ---
const columns = [
  { name: 'receiptNo', label: 'RECEIPT', field: 'receiptNo', align: 'left', sortable: true },
  { name: 'date', label: 'DATE', field: 'date', align: 'left', sortable: true },
  { name: 'studentName', label: 'STUDENT', field: 'studentName', align: 'left', sortable: true },
  { name: 'className', label: 'CLASS', field: 'className', align: 'left' },
  { name: 'month', label: 'PERIOD', field: (row) => `${row.month} ${row.year}`, align: 'left' },
  { name: 'amount', label: 'AMOUNT', field: 'amount', align: 'right', sortable: true },
  { name: 'actions', label: 'ACTIONS', align: 'center' },
]

const pendingColumns = [
  { name: 'studentName', label: 'STUDENT', field: 'studentName', align: 'left', sortable: true },
  {
    name: 'className',
    label: 'SUBJECT / CLASS',
    field: 'className',
    align: 'left',
    sortable: true,
  },
  { name: 'month', label: 'MONTH', field: 'month', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' },
  { name: 'actions', label: 'ACTIONS', align: 'right' },
]

// --- Computed ---
const pendingPayments = computed(() => {
  const m = selectedMonth.value
  const y = selectedYear.value
  const pending = []

  studentStore.students.forEach((student) => {
    // Check registered classes
    if (student.classes && student.classes.length > 0) {
      student.classes.forEach((clsName) => {
        // Check if paid
        // Check if paid with robust matching
        const hasPaid = paymentStore.payments.some((p) => {
          if (p.studentId !== student.id || p.month !== m || Number(p.year) !== Number(y))
            return false

          const pName = (p.className || '').toLowerCase().trim()
          const target = clsName.toLowerCase().trim()

          if (pName === target || pName === 'other/general') return true

          // Extract numbers to distinguish sessions (Maths 1, Maths 2, etc.)
          const pNums = pName.match(/\d+/g) || []
          const targetNums = target.match(/\d+/g) || []

          // If session numbers exist and don't match, they are different classes
          if (targetNums.length > 0 && pNums.join(',') !== targetNums.join(',')) return false

          // Match if one contains the other (resilient to "English 2-Grade 11" vs "English 2")
          return pName.includes(target) || target.includes(pName)
        })

        if (!hasPaid) {
          pending.push({
            id: `${student.id}-${clsName}-${m}`,
            uniqueId: student.id, // For opening payment dialog
            studentName: student.name,
            studentId: student.id_number,
            className: clsName,
            month: m,
            year: y,
            status: 'Pending',
          })
        }
      })
    } else {
      // Logic for students with no specific classes:
      // Maybe they owe a 'General' fee?
      // For now, let's omit them to avoid clutter, or assume they are not enrolled in billable subjects.
    }
  })
  return pending
})

const availableClassesForStudent = computed(() => {
  if (!selectedStudent.value) return []
  if (!selectedStudent.value.classes || selectedStudent.value.classes.length === 0) {
    return classStore.classes
  }
  const filtered = classStore.classes.filter((c) => {
    return selectedStudent.value.classes.some((subName) => {
      if (!subName) return false
      const sub = subName.toLowerCase()
      const className = (c.name || '').toLowerCase()
      const classSubject = (c.subject || '').toLowerCase()
      return (
        className.includes(sub) ||
        sub.includes(className) ||
        classSubject.includes(sub) ||
        sub.includes(classSubject)
      )
    })
  })
  return filtered.length > 0 ? filtered : classStore.classes
})

// --- Watchers ---
watch(selectedStudent, () => {
  selectedClass.value = null
})

watch(selectedClass, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    paymentForm.value.amount = newVal.fee || 0
  }
})

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'pending') {
      activeTab.value = 'pending'
    }
  },
)

// --- Methods ---
function filterStudents(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    studentOptions.value = studentStore.students.filter(
      (v) =>
        v.name.toLowerCase().indexOf(needle) > -1 ||
        (v.id_number || '').toLowerCase().indexOf(needle) > -1,
    )
  })
}

function filterClasses(val, update) {
  if (val === '') {
    update(() => {
      classOptions.value = availableClassesForStudent.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    classOptions.value = availableClassesForStudent.value.filter(
      (v) =>
        (v.name || '').toLowerCase().indexOf(needle) > -1 ||
        (v.subject || '').toLowerCase().indexOf(needle) > -1,
    )
  })
}

function resetForm() {
  selectedStudent.value = null
  selectedClass.value = null
  paymentForm.value.amount = 0
  paymentForm.value.month = months[new Date().getMonth()]
}

const openPaymentForStudent = (pendingRecord) => {
  // Find full student object
  const student = studentStore.students.find((s) => s.id === pendingRecord.uniqueId)
  if (student) {
    selectedStudent.value = student
    // Try to auto-select class logic could go here if we matched text to ID
    // For now, let's just prepopulate month/year
    paymentForm.value.month = pendingRecord.month
    paymentForm.value.year = pendingRecord.year

    // Find the best matching class from classStore
    const target = (pendingRecord.className || '').toLowerCase().trim()
    const targetNums = target.match(/\d+/g) || []

    const bestMatch = classStore.classes.find((c) => {
      const cName = (c.name || '').toLowerCase().trim()
      const cSub = (c.subject || '').toLowerCase().trim()

      // Exact match
      if (cName === target || cSub === target) return true

      // Session Number Check
      const cNameNums = cName.match(/\d+/g) || []
      const cSubNums = cSub.match(/\d+/g) || []

      // If session numbers exist and don't match, skip
      if (targetNums.length > 0) {
        const numMatch =
          cNameNums.join(',') === targetNums.join(',') ||
          cSubNums.join(',') === targetNums.join(',')
        if (!numMatch) return false
      }

      // Substring match
      return cName.includes(target) || cSub.includes(target) || target.includes(cSub)
    })

    if (bestMatch) {
      selectedClass.value = bestMatch
    }
    showPaymentDialog.value = true
  }
}

const submitPayment = async () => {
  if (!selectedStudent.value || !selectedClass.value || !paymentForm.value.amount) {
    $q.notify({ type: 'warning', message: 'Please complete all payment details.' })
    return
  }

  const isCustomClass = typeof selectedClass.value === 'string'
  const pData = {
    studentId: selectedStudent.value.id,
    studentName: selectedStudent.value.name,
    classId: isCustomClass ? null : selectedClass.value.id, // Fixed: don't use Date.now() for ID
    className: isCustomClass ? selectedClass.value : selectedClass.value.name,
    month: paymentForm.value.month,
    year: paymentForm.value.year,
    amount: paymentForm.value.amount,
  }

  const result = await paymentStore.addPayment(pData)
  if (result) {
    activeReceipt.value = result
    showPaymentDialog.value = false
    receiptDialog.value = true

    $q.notify({
      type: 'positive',
      message: 'Payment recorded successfully!',
      position: 'top',
    })
    resetForm()
  }
}

const printReceipt = (row) => {
  activeReceipt.value = row
  receiptDialog.value = true
}

const handlePrint = () => {
  window.print()
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Delete Record',
    message: `Are you sure you want to delete receipt ${row.receiptNo}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    paymentStore.deletePayment(row.id)
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
@media print {
  .no-print {
    display: none !important;
  }
  .q-layout,
  .q-header,
  .q-drawer,
  .q-page-container {
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
  }
  .receipt-card {
    box-shadow: none !important;
    border: 1px solid #e0e0e0 !important;
    margin: 0 !important;
  }
}
</style>
