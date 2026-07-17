<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-indigo-10">License Master Control</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          Generate and manage license keys for your tuition institutes
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="indigo-10"
          icon="add"
          label="Generate New Keys"
          rounded
          unelevated
          @click="showGenerateDialog = true"
          class="q-px-lg shadow-2"
        />
      </div>
    </div>

    <!-- Stats summary -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered class="rounded-borders bg-white q-pa-sm">
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

    <!-- License Keys Table -->
    <q-card flat bordered class="rounded-borders overflow-hidden">
      <q-table
        :rows="licenseKeys"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        class="bg-white"
      >
        <template v-slot:body-cell-key="props">
          <q-td :props="props">
            <div class="row items-center">
              <div class="font-mono text-weight-bold text-indigo-7">{{ props.row.key_code }}</div>
              <q-btn
                flat
                round
                color="grey-7"
                icon="content_copy"
                size="xs"
                class="q-ml-sm"
                @click="copyToClipboard(props.row.key_code)"
              >
                <q-tooltip>Copy Key</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <q-badge
              :color="getStatusColor(props.row.status)"
              class="q-px-md q-py-xs text-weight-bold"
            >
              {{ props.row.status.toUpperCase() }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-plan_type="props">
          <q-td :props="props">
            <div class="text-capitalize text-weight-medium">{{ props.row.plan_type }}</div>
            <div class="text-caption text-grey-5">{{ props.row.duration_months }} Months</div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              flat
              round
              color="red"
              icon="delete"
              size="sm"
              @click="deleteKey(props.row.id)"
              :disable="props.row.status === 'used'"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Generate Dialog -->
    <q-dialog v-model="showGenerateDialog">
      <q-card style="width: 400px; border-radius: 12px">
        <q-card-section class="bg-indigo-10 text-white row items-center">
          <div class="text-h6">Generate Keys</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-select
              v-model="genForm.plan"
              :options="planOptions"
              label="Select Plan Type"
              outlined
              emit-value
              map-options
            />
            <q-input
              v-model.number="genForm.count"
              type="number"
              label="Number of keys to generate"
              outlined
              min="1"
              max="50"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn label="Cancel" flat color="grey-8" v-close-popup />
          <q-btn
            label="Generate Now"
            color="indigo-10"
            unelevated
            rounded
            @click="generateKeys"
            :loading="generating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, copyToClipboard as qCopyToClipboard } from 'quasar'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const loading = ref(false)
const generating = ref(false)
const showGenerateDialog = ref(false)
const licenseKeys = ref([])

const genForm = ref({
  plan: 'monthly',
  count: 1,
})

const planOptions = [
  { label: 'Monthly (1 Month)', value: 'monthly', months: 1 },
  { label: 'Quarterly (4 Months)', value: 'quarterly', months: 4 },
  { label: 'Yearly (12 Months)', value: 'yearly', months: 12 },
]

const stats = computed(() => {
  const active = licenseKeys.value.filter((k) => k.status === 'active').length
  const used = licenseKeys.value.filter((k) => k.status === 'used').length
  return [
    { label: 'Total Keys', value: licenseKeys.value.length, icon: 'vpn_key', color: 'indigo' },
    { label: 'Active Keys', value: active, icon: 'check_circle', color: 'green' },
    { label: 'Used Keys', value: used, icon: 'history', color: 'orange' },
    { label: 'Plans', value: 3, icon: 'layers', color: 'purple' },
  ]
})

const columns = [
  { name: 'key', align: 'left', label: 'LICENSE KEY', field: 'key_code' },
  { name: 'plan_type', align: 'left', label: 'PLAN TYPE', field: 'plan_type' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  {
    name: 'created_at',
    align: 'left',
    label: 'CREATED ON',
    field: 'created_at',
    format: (val) => new Date(val).toLocaleDateString(),
  },
  { name: 'actions', align: 'right', label: 'ACTIONS', field: 'id' },
]

const getStatusColor = (status) => {
  if (status === 'active') return 'green-7'
  if (status === 'used') return 'orange-7'
  return 'red-7'
}

const fetchKeys = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('license_keys')
    .select('*')
    .order('created_at', { ascending: false })
  if (!error) licenseKeys.value = data
  loading.value = false
}

const generateKeys = async () => {
  generating.value = true
  const selectedPlan = planOptions.find((p) => p.value === genForm.value.plan)
  const newKeys = []

  for (let i = 0; i < genForm.value.count; i++) {
    const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const randomPart3 = Math.random().toString(36).substring(2, 6).toUpperCase()

    newKeys.push({
      key_code: `ANW-${randomPart1}-${randomPart2}-${randomPart3}`,
      plan_type: selectedPlan.value,
      duration_months: selectedPlan.months,
      status: 'active',
    })
  }

  const { error } = await supabase.from('license_keys').insert(newKeys)

  if (!error) {
    $q.notify({ type: 'positive', message: `${genForm.value.count} keys generated!` })
    showGenerateDialog.value = false
    await fetchKeys()
  } else {
    $q.notify({ type: 'negative', message: 'Failed to generate keys: ' + error.message })
  }
  generating.value = false
}

const deleteKey = async (id) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this key? This cannot be undone.',
    cancel: true,
    ok: { label: 'Delete', color: 'red', flat: true },
  }).onOk(async () => {
    const { error } = await supabase.from('license_keys').delete().eq('id', id)
    if (!error) {
      $q.notify({ type: 'positive', message: 'Key deleted' })
      await fetchKeys()
    }
  })
}

const copyToClipboard = (key) => {
  qCopyToClipboard(key).then(() =>
    $q.notify({ type: 'positive', message: 'Key copied!', timeout: 1000 }),
  )
}

onMounted(fetchKeys)
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
