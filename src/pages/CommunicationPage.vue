<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Broadcast & Communication</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Send updates, notices and reminders to students
        </p>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Compose Column -->
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="rounded-borders modern-card full-height">
          <q-card-section class="bg-indigo-7 text-white q-py-sm">
            <div class="text-subtitle1 text-weight-bold row items-center">
              <q-icon name="send" class="q-mr-sm" />
              Compose Message
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-form ref="commFormRef" @submit="onSubmit" class="q-gutter-y-md">
              <!-- Channels Selection -->
              <div class="text-subtitle2 text-grey-7 q-mb-xs">Select Delivery Channels</div>
              <div class="row q-col-gutter-sm">
                <div v-for="channel in channels" :key="channel.id" class="col-6 col-sm-3">
                  <q-checkbox
                    v-model="selectedChannels"
                    :val="channel.id"
                    :label="channel.label"
                    class="full-width q-pa-sm rounded-borders channel-box"
                    :class="
                      selectedChannels.includes(channel.id)
                        ? `bg-${channel.color}-1 text-${channel.color} border-${channel.color}`
                        : 'bg-grey-1'
                    "
                  >
                    <template v-slot:default>
                      <q-icon :name="channel.icon" class="q-ml-xs" />
                    </template>
                  </q-checkbox>
                </div>
              </div>

              <!-- Recipients Selection -->
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="targetGroup"
                    :options="targetOptions"
                    label="Target Group"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-6" v-if="targetGroup === 'class'">
                  <q-select
                    v-model="selectedClass"
                    :options="classOptions"
                    label="Select Class"
                    outlined
                    dense
                    option-label="name"
                    option-value="id"
                  />
                </div>
                <div class="col-12 col-sm-6" v-if="targetGroup === 'grade'">
                  <q-select
                    v-model="selectedGrade"
                    :options="gradeOptions"
                    label="Select Grade"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- Message Content -->
              <div class="q-mt-lg">
                <!-- Helper info for empty selection -->
                <div
                  v-if="
                    filteredStudentsCount === 0 &&
                    (targetGroup === 'class' || targetGroup === 'grade')
                  "
                  class="bg-amber-1 q-pa-sm q-mb-sm rounded-borders text-amber-9 text-caption row items-center"
                >
                  <q-icon name="warning" class="q-mr-xs" />
                  No students assigned to this {{ targetGroup }}.
                  <q-btn
                    flat
                    dense
                    icon="bug_report"
                    label="Debug"
                    size="xs"
                    @click="showFilterDebug = !showFilterDebug"
                    class="q-ml-sm"
                  />
                </div>

                <div
                  v-if="showFilterDebug"
                  class="bg-grey-2 q-pa-sm q-mb-sm text-caption rounded-borders overflow-auto"
                  style="max-height: 150px"
                >
                  <strong>Searching for:</strong> "{{ debugSearchName }}"<br />
                  <strong>Student Sample:</strong>
                  <ul class="q-my-none">
                    <li v-for="s in studentStore.students.slice(0, 3)" :key="s.id">
                      {{ s.name }}: [{{ (s.classes || s.subjects || []).join(', ') }}]
                    </li>
                  </ul>
                </div>

                <q-input
                  v-model.trim="messageTitle"
                  label="Subject / Title"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(val) => !!val || 'Title is required']"
                  placeholder="e.g. Class Rescheduled, Monthly Fees Due"
                />
                <q-editor
                  v-model="messageBody"
                  flat
                  bordered
                  content-class="bg-white"
                  toolbar-text-color="grey-9"
                  toolbar-toggle-color="primary"
                  toolbar-bg="grey-1"
                  :toolbar="[
                    ['bold', 'italic', 'underline'],
                    ['unordered', 'ordered'],
                    ['undo', 'redo'],
                  ]"
                  placeholder="Type your message here..."
                  min-height="200px"
                  class="rounded-borders q-mt-sm"
                />
              </div>

              <div class="row justify-between items-center q-mt-lg">
                <div class="text-caption text-grey-6 italic">
                  * Dynamic tags like {name} will be replaced automatically.
                </div>
                <div class="row items-center q-gutter-x-md">
                  <div
                    class="text-subtitle2"
                    :class="filteredStudentsCount > 0 ? 'text-indigo-7' : 'text-negative'"
                  >
                    <q-icon :name="filteredStudentsCount > 0 ? 'people' : 'warning'" />
                    {{ filteredStudentsCount }} recipients selected
                  </div>
                  <q-btn
                    label="Send Broadcast Now"
                    color="black"
                    icon="rocket_launch"
                    unelevated
                    rounded
                    size="lg"
                    class="q-px-xl"
                    type="submit"
                    :loading="sending || studentStore.loading"
                    :disable="selectedChannels.length === 0 || filteredStudentsCount === 0"
                  />
                  <q-btn flat round color="grey-6" icon="refresh" @click="refreshData">
                    <q-tooltip>Refresh Students & Classes</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- History Column -->
      <div class="col-12 col-lg-5">
        <q-card flat bordered class="rounded-borders modern-card full-height">
          <q-card-section class="bg-grey-2 text-grey-9 q-py-sm row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">Recent Communications</div>
            <q-btn flat round dense icon="delete_sweep" color="grey-6" @click="clearHistory">
              <q-tooltip>Clear History</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-scroll-area style="height: 600px">
              <q-list separator>
                <div v-if="history.length === 0" class="text-center q-pa-xl text-grey-5">
                  <q-icon name="history" size="48px" class="q-mb-md" />
                  <div>No message history found</div>
                </div>

                <q-item v-for="item in history" :key="item.id" class="q-py-md">
                  <q-item-section avatar top>
                    <q-avatar
                      :color="getChannelColor(item.channels[0])"
                      text-white
                      icon="message"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-grey-9">{{
                      item.title
                    }}</q-item-label>
                    <q-item-label caption class="line-clamp-2">
                      <div v-html="item.body"></div>
                    </q-item-label>
                    <q-item-label caption class="q-mt-xs row items-center">
                      <q-badge
                        outline
                        :color="getChannelColor(c)"
                        v-for="c in item.channels"
                        :key="c"
                        class="q-mr-xs"
                      >
                        {{ c }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-item-label caption>{{ formatDate(item.timestamp) }}</q-item-label>
                    <q-btn
                      flat
                      dense
                      size="sm"
                      color="primary"
                      label="View Recipients"
                      class="q-mt-xs"
                      @click="showRecipients(item)"
                    />
                    <q-badge color="green-1" text-color="green-9" class="q-mt-xs">
                      Sent to {{ item.recipientCount }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recipients View Dialog -->
    <q-dialog v-model="recipientDialog">
      <q-card style="width: 400px; border-radius: 20px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Recipients List</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-scroll-area style="height: 300px">
            <q-list padding separator>
              <q-item v-for="(rec, index) in selectedRecipients" :key="index">
                <q-item-section avatar>
                  <q-avatar color="indigo-1" text-color="indigo" size="sm">{{
                    index + 1
                  }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ rec.name }}</q-item-label>
                  <q-item-label caption class="row items-center">
                    <q-icon name="phone" size="xs" color="green" class="q-mr-xs" v-if="rec.phone" />
                    <span class="q-mr-md" v-if="rec.phone">{{ rec.phone }}</span>
                    <q-icon name="email" size="xs" color="red" class="q-mr-xs" v-if="rec.email" />
                    <span v-if="rec.email">{{ rec.email }}</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    color="green"
                    icon="chat"
                    @click="openWhatsApp(rec.phone)"
                    v-if="rec.phone && rec.phone !== 'N/A'"
                  >
                    <q-tooltip>Send via WhatsApp</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'
import { useCommunicationStore } from 'src/stores/communicationStore'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const userStore = useUserStore()
const studentStore = useStudentStore()
const classStore = useClassStore()
const commStore = useCommunicationStore()

const commFormRef = ref(null)

const sending = ref(false)
const showFilterDebug = ref(false)
const recipientDialog = ref(false)
const selectedRecipients = ref([])
const selectedChannels = ref(['notification'])
const targetGroup = ref('all')
const selectedClass = ref(null)
const selectedGrade = ref(null)
const selectedMessageBody = ref('')
const messageTitle = ref('')
const messageBody = ref('')

const channels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: 'green' },
  { id: 'sms', label: 'SMS', icon: 'sms', color: 'blue' },
  { id: 'email', label: 'Email', icon: 'email', color: 'red' },
  { id: 'notification', label: 'In-App', icon: 'notifications', color: 'orange' },
]

const targetOptions = [
  { label: 'All Students', value: 'all' },
  { label: 'Specific Class', value: 'class' },
  { label: 'Specific Grade', value: 'grade' },
]

const classOptions = computed(() => classStore.classes)
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

const refreshData = async () => {
  // 1. Ensure we have institute session first
  if (!userStore.institute?.id) {
    console.log('Fetching fresh session in CommunicationPage...')
    await userStore.fetchSession()
  }

  // 2. Clear current lists to avoid stagnant state
  studentStore.students = []

  // 3. Fetch data
  await Promise.all([studentStore.fetchStudents(), classStore.fetchClasses()])

  console.log(
    `Loaded ${studentStore.students.length} students and ${classStore.classes.length} classes.`,
  )
}

onMounted(async () => {
  await refreshData()
})

const debugSearchName = computed(() => {
  if (targetGroup.value === 'class' && selectedClass.value) {
    if (typeof selectedClass.value === 'object') return selectedClass.value.name
    const cls = classStore.classes.find((c) => c.id === selectedClass.value)
    return cls ? cls.name : selectedClass.value
  }
  return ''
})

const filteredStudents = computed(() => {
  if (!studentStore.students || studentStore.students.length === 0) return []

  if (targetGroup.value === 'all') {
    return studentStore.students
  } else if (targetGroup.value === 'class' && selectedClass.value) {
    // 1. Get the target class name AND ID accurately
    let targetName = ''
    let targetId = ''

    if (typeof selectedClass.value === 'object' && selectedClass.value !== null) {
      targetName = selectedClass.value.name || ''
      targetId = selectedClass.value.id || ''
    } else {
      const cls = classStore.classes.find(
        (c) => c.id === selectedClass.value || c.name === selectedClass.value,
      )
      if (cls) {
        targetName = cls.name
        targetId = cls.id
      } else {
        targetName = typeof selectedClass.value === 'string' ? selectedClass.value : ''
        targetId = targetName
      }
    }

    if (!targetName && !targetId) return []

    // 2. Scan students with extreme robustness
    return studentStore.students.filter((s) => {
      // Look at both 'classes' and 'subjects'
      const assigned = Array.isArray(s.classes)
        ? s.classes
        : Array.isArray(s.subjects)
          ? s.subjects
          : []

      return assigned.some((c) => {
        if (!c) return false
        // Handle if 'c' is an object or a string
        const val = typeof c === 'object' ? c.name || c.id || '' : c.toString()

        const cleanVal = val.trim().toLowerCase()
        const cleanTarget = targetName.trim().toLowerCase()

        return cleanVal === cleanTarget || val === targetId
      })
    })
  } else if (targetGroup.value === 'grade' && selectedGrade.value) {
    return studentStore.students.filter((s) => s.grade === selectedGrade.value)
  }
  return []
})

const filteredStudentsCount = computed(() => filteredStudents.value.length)

const history = computed(() => commStore.history)

const getChannelColor = (id) => {
  return channels.find((c) => c.id === id)?.color || 'grey'
}

const formatDate = (isoStr) => {
  const date = new Date(isoStr)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

const onSubmit = async () => {
  // Manual check first to be absolutely sure
  if (!messageTitle.value || messageTitle.value.trim() === '') {
    $q.notify({
      color: 'negative',
      message: 'Subject / Title is required',
      icon: 'error',
    })
    return
  }

  const success = await commFormRef.value.validate()
  if (success) {
    const cleanBody = messageBody.value ? messageBody.value.replace(/<[^>]*>/g, '').trim() : ''

    if (!cleanBody || cleanBody === '') {
      $q.notify({
        color: 'negative',
        message: 'Please type a message body',
        icon: 'warning',
      })
      return
    }
    sendBroadcast()
  }
}

const sendBroadcast = () => {
  sending.value = true

  const studentsToSend = filteredStudents.value
  const recipientsData = studentsToSend.map((s) => ({
    name: s.name,
    phone: s.phone || s.parentPhone || 'N/A',
    email: s.email || 'N/A',
  }))

  // Simulate heavy processing delay
  setTimeout(() => {
    // 1. Log the communication
    commStore.logMessage({
      title: messageTitle.value,
      body: messageBody.value,
      channels: [...selectedChannels.value],
      target: targetGroup.value,
      recipientCount: studentsToSend.length,
      recipients: recipientsData,
    })

    // 2. Notify success
    $q.notify({
      type: 'positive',
      message: `Broadcast logged for ${studentsToSend.length} recipients successfully. Click "View Recipients" to send via WhatsApp.`,
      icon: 'done_all',
    })

    // 3. Reset form
    messageTitle.value = ''
    messageBody.value = ''

    // Clear validation state
    nextTick(() => {
      if (commFormRef.value) {
        commFormRef.value.resetValidation()
      }
    })

    sending.value = false
  }, 1500)
}

const showRecipients = (item) => {
  selectedRecipients.value = item.recipients || []
  selectedMessageBody.value = item.body || ''
  recipientDialog.value = true
}

const openWhatsApp = (phone) => {
  if (!phone || phone === 'N/A') return

  // Clean the phone number (remove spaces, dashes, etc.)
  let cleanPhone = phone.toString().replace(/\D/g, '')

  // If it starts with 0, assume it's Sri Lankan and add 94
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('94') && cleanPhone.length === 9) {
    // Also handle 9-digit numbers without leading zero
    cleanPhone = '94' + cleanPhone
  }

  // Clean the message body from HTML tags
  const cleanBody = selectedMessageBody.value
    ? selectedMessageBody.value.replace(/<[^>]*>/g, '').trim()
    : ''

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(cleanBody)}`
  window.open(url, '_blank')
}

const clearHistory = () => {
  $q.dialog({
    title: 'Clear History',
    message: 'Are you sure you want to clear all communication logs?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    commStore.clearHistory()
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
.channel-box {
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}
.border-green {
  border-color: #4caf50 !important;
}
.border-blue {
  border-color: #2196f3 !important;
}
.border-red {
  border-color: #f44336 !important;
}
.border-orange {
  border-color: #ff9800 !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.uppercase {
  text-transform: uppercase;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
