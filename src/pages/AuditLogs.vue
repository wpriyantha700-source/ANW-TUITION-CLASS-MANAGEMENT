<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-indigo-10">System Audit Logs</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Monitor all system activities and data changes for security auditing
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="white"
          text-color="black"
          icon="refresh"
          label="Refresh Logs"
          rounded
          unelevated
          @click="fetchLogs"
          :loading="loading"
          class="q-px-lg shadow-2"
        />
      </div>
    </div>

    <!-- Filters & Search -->
    <q-card flat bordered class="rounded-borders q-mb-lg bg-white">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-4">
            <q-input
              v-model="filter"
              placeholder="Search by user or action..."
              outlined
              dense
              rounded
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="tableFilter"
              :options="tableOptions"
              label="Select Table"
              outlined
              dense
              rounded
              clearable
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="actionFilter"
              :options="['INSERT', 'UPDATE', 'DELETE']"
              label="Select Action"
              outlined
              dense
              rounded
              clearable
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Logs Table -->
    <q-card flat bordered class="rounded-borders overflow-hidden">
      <q-table
        :rows="filteredLogs"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :pagination="pagination"
        class="bg-white audit-table"
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props" align="center">
            <q-badge :color="getActionColor(props.value)" class="q-px-md q-py-xs text-weight-bold">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-details="props">
          <q-td :props="props" align="center">
            <q-btn
              flat
              round
              color="indigo"
              icon="visibility"
              size="sm"
              @click="viewLogDetails(props.row)"
            >
              <q-tooltip>View Detailed Changes</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 600px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="bg-indigo-10 text-white row items-center">
          <div class="text-h6 text-weight-bold">Log Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">USER</div>
              <div class="text-weight-bold text-indigo-9">
                {{ selectedLog?.user_email || 'System' }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">TIMESTAMP</div>
              <div class="text-weight-bold">
                {{ new Date(selectedLog?.created_at).toLocaleString() }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">ACTION</div>
              <q-badge :color="getActionColor(selectedLog?.action)" class="text-weight-bold">
                {{ selectedLog?.action }}
              </q-badge>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">TARGET TABLE</div>
              <div class="text-weight-bold text-uppercase">{{ selectedLog?.table_name }}</div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="row q-col-gutter-md">
            <div class="col-12" v-if="selectedLog?.old_data">
              <div class="text-subtitle1 text-weight-bold q-mb-sm text-red-9">Previous Data</div>
              <pre class="bg-red-1 q-pa-md rounded-borders json-pre">{{
                JSON.stringify(selectedLog.old_data, null, 2)
              }}</pre>
            </div>
            <div class="col-12" v-if="selectedLog?.new_data">
              <div class="text-subtitle1 text-weight-bold q-mb-sm text-green-9">New Data</div>
              <pre class="bg-green-1 q-pa-md rounded-borders json-pre">{{
                JSON.stringify(selectedLog.new_data, null, 2)
              }}</pre>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn label="Close" color="black" unelevated rounded v-close-popup class="q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'src/boot/supabase'

const loading = ref(false)
const logs = ref([])
const filter = ref('')
const tableFilter = ref(null)
const actionFilter = ref(null)
const showDetailsDialog = ref(false)
const selectedLog = ref(null)

const tableOptions = ['students', 'payments', 'classes', 'institutes']

const columns = [
  {
    name: 'created_at',
    align: 'left',
    label: 'TIME',
    field: 'created_at',
    format: (val) => new Date(val).toLocaleString(),
    sortable: true,
  },
  { name: 'user', align: 'left', label: 'USER (EMAIL)', field: 'user_email', sortable: true },
  { name: 'action', align: 'center', label: 'ACTION', field: 'action', sortable: true },
  { name: 'table', align: 'left', label: 'TABLE', field: 'table_name', sortable: true },
  { name: 'record_id', align: 'left', label: 'RECORD ID', field: 'record_id' },
  { name: 'details', align: 'center', label: 'CHANGES', field: 'id' },
]

const pagination = {
  sortBy: 'created_at',
  descending: true,
  rowsPerPage: 20,
}

const getActionColor = (action) => {
  if (action === 'INSERT') return 'green-7'
  if (action === 'UPDATE') return 'blue-7'
  if (action === 'DELETE') return 'red-7'
  return 'grey-7'
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    logs.value = data
  } catch (error) {
    console.error('Error fetching audit logs:', error)
  } finally {
    loading.value = false
  }
}

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const searchStr = filter.value.toLowerCase()
    const matchesSearch =
      !searchStr ||
      (log.user_email || '').toLowerCase().includes(searchStr) ||
      (log.action || '').toLowerCase().includes(searchStr) ||
      (log.table_name || '').toLowerCase().includes(searchStr)

    const matchesTable = !tableFilter.value || log.table_name === tableFilter.value
    const matchesAction = !actionFilter.value || log.action === actionFilter.value

    return matchesSearch && matchesTable && matchesAction
  })
})

const viewLogDetails = (log) => {
  selectedLog.value = log
  showDetailsDialog.value = true
}

onMounted(fetchLogs)
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.json-pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}
.audit-table :deep(th) {
  font-weight: bold;
  background-color: #f8f9fa;
  color: #1a237e;
}
</style>
