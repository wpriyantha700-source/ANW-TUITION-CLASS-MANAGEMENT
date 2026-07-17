<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto text-left">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">User Management</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">Manage system access and roles</p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="black"
          icon="add"
          label="Add New User"
          rounded
          class="q-px-md shadow-2"
          @click="addNewUser"
        />
      </div>
    </div>

    <!-- Toolbar: Search and Filter -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filterText"
          outlined
          dense
          rounded
          bg-color="white"
          placeholder="Search by name or email..."
          class="modern-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-8 flex items-center justify-end q-gutter-sm">
        <q-chip
          v-for="role in ['All', ...roleOptions]"
          :key="role"
          clickable
          @click="selectedRole = role"
          :color="selectedRole === role ? 'black' : 'white'"
          :text-color="selectedRole === role ? 'white' : 'black'"
          :outline="selectedRole !== role"
          class="role-filter-chip shadow-1"
        >
          {{ role }}
        </q-chip>
      </div>
    </div>

    <!-- Modern Table Container -->
    <q-card flat bordered class="rounded-borders modern-card overflow-hidden">
      <q-table
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :pagination="pagination"
        class="bg-white modern-table"
        binary-state-sort
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="36px" class="q-mr-md shadow-1">
                <img :src="`https://api.dicebear.com/7.x/initials/svg?seed=${props.row.name}`" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-grey-9">{{ props.row.name }}</div>
                <div class="text-caption text-grey-6 gt-sm">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props" align="center">
            <q-badge
              rounded
              :color="getRoleColor(props.row.role)"
              class="q-px-sm q-py-xs role-badge"
            >
              {{ props.row.role }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <div class="q-gutter-xs">
              <q-btn flat round color="indigo" icon="edit" size="sm" @click="editUser(props.row)">
                <q-tooltip>Edit Account</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="red-4"
                icon="delete_outline"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Remove Access</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="group_off" size="64px" class="q-mb-md" />
            <div class="text-h6 text-weight-light">No users found matching your criteria.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Add/Edit User Dialog -->
    <q-dialog v-model="showAddDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 450px; max-width: 95vw" class="rounded-borders modern-dialog shadow-24">
        <q-card-section class="bg-black text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEditing ? 'Update User Account' : 'Create New Account' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form @submit="saveUser" class="q-gutter-y-xs">
            <!-- Name -->
            <q-input
              v-model="userForm.name"
              label="Full Name"
              outlined
              dense
              class="modern-input"
              :rules="[(val) => !!val || 'Required']"
            >
              <template v-slot:prepend><q-icon name="person_outline" /></template>
            </q-input>

            <!-- Email -->
            <q-input
              v-model="userForm.email"
              label="Email Address"
              type="email"
              outlined
              dense
              class="modern-input"
              :rules="[(val) => !!val || 'Required']"
              :disable="isEditing"
            >
              <template v-slot:prepend><q-icon name="mail_outline" /></template>
            </q-input>

            <!-- Phone -->
            <q-input
              v-model="userForm.phone"
              label="Phone Number"
              type="tel"
              outlined
              dense
              class="modern-input"
              mask="### #######"
              unmasked-value
              placeholder="077 1234567"
            >
              <template v-slot:prepend><q-icon name="phone_iphone" /></template>
            </q-input>

            <!-- Role -->
            <q-select
              v-model="userForm.role"
              :options="roleOptions"
              label="System Role"
              outlined
              dense
              class="modern-input"
              :rules="[(val) => !!val || 'Required']"
            >
              <template v-slot:prepend><q-icon name="shield" /></template>
            </q-select>

            <!-- Password (Only for new users) -->
            <q-input
              v-if="!isEditing"
              v-model="userForm.password"
              :type="showPassword ? 'text' : 'password'"
              label="Secret Password"
              outlined
              dense
              class="modern-input"
              :rules="[
                (val) => !!val || 'Required',
                (val) => val.length >= 6 || 'Min 6 characters',
              ]"
            >
              <template v-slot:prepend><q-icon name="lock_open" /></template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Action Buttons -->
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn label="Cancel" flat color="grey-7" v-close-popup />
              <q-btn
                :label="isEditing ? 'Update User' : 'Create Account'"
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
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// --- State ---
const loading = ref(false)
const showAddDialog = ref(false)
const isEditing = ref(false)
const showPassword = ref(false)

const filterText = ref('')
const selectedRole = ref('All')

const userForm = ref({
  name: '',
  email: '',
  phone: '',
  role: 'Teacher',
  password: '',
})

const roleOptions = ['Admin', 'Teacher', 'Staff', 'Student']

const users = ref([
  {
    id: 1,
    name: 'Priyantha Withanage',
    email: 'priyantha@example.com',
    phone: '0771234567',
    role: 'Admin',
  },
  { id: 2, name: 'Sunil Perera', email: 'sunil@example.com', phone: '0711111111', role: 'Teacher' },
  { id: 3, name: 'Nimali Silva', email: 'nimali@example.com', phone: '0752222222', role: 'Staff' },
  { id: 4, name: 'Kamal Bandara', email: 'kamal@anw.com', phone: '0763333333', role: 'Student' },
  { id: 5, name: 'Janaki Dias', email: 'janaki@anw.com', phone: '0704444444', role: 'Teacher' },
])

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const columns = [
  { name: 'name', align: 'left', label: 'USER DETAILS', field: 'name', sortable: true },
  { name: 'role', align: 'center', label: 'ACCESS LEVEL', field: 'role' },
  { name: 'actions', align: 'right', label: 'OPERATIONS', field: 'actions' },
]

// --- Computed ---
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesFilterText =
      user.name.toLowerCase().includes(filterText.value.toLowerCase()) ||
      user.email.toLowerCase().includes(filterText.value.toLowerCase())

    const matchesRole = selectedRole.value === 'All' || user.role === selectedRole.value

    return matchesFilterText && matchesRole
  })
})

// --- Methods ---
function getRoleColor(role) {
  switch (role) {
    case 'Admin':
      return 'indigo-7'
    case 'Teacher':
      return 'green-7'
    case 'Staff':
      return 'orange-7'
    case 'Student':
      return 'blue-7'
    default:
      return 'grey-7'
  }
}

function addNewUser() {
  isEditing.value = false
  userForm.value = { name: '', email: '', phone: '', role: 'Teacher', password: '' }
  showPassword.value = false
  showAddDialog.value = true
}

function editUser(user) {
  isEditing.value = true
  userForm.value = { ...user }
  showAddDialog.value = true
}

function saveUser() {
  loading.value = true

  setTimeout(() => {
    if (isEditing.value) {
      const index = users.value.findIndex((u) => u.id === userForm.value.id)
      if (index !== -1) {
        users.value[index] = { ...userForm.value }
      }
      $q.notify({ type: 'positive', message: 'Account updated successfully', position: 'top' })
    } else {
      const newId = users.value.length > 0 ? Math.max(...users.value.map((u) => u.id)) + 1 : 1
      users.value.push({ id: newId, ...userForm.value })
      $q.notify({ type: 'positive', message: 'New user account created', position: 'top' })
    }

    showAddDialog.value = false
    loading.value = false
  }, 600)
}

function confirmDelete(user) {
  $q.dialog({
    title: `<div class="text-red-7">Remove Access?</div>`,
    message: `You are about to revoke system access for <b>${user.name}</b>.`,
    html: true,
    cancel: { flat: true, label: 'Keep User', color: 'grey-8' },
    persistent: true,
    ok: { color: 'red-7', label: 'Delete', unelevated: true, rounded: true },
  }).onOk(() => {
    users.value = users.value.filter((u) => u.id !== user.id)
    $q.notify({
      type: 'negative',
      message: `${user.name} removed.`,
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
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.modern-table :deep(.q-table__card) {
  box-shadow: none;
}
.modern-table :deep(thead tr th) {
  background-color: #fafafa;
  color: #757575;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #f0f0f0;
}
.modern-table :deep(tbody tr:hover) {
  background-color: #f5f7ff !important;
}
.modern-search :deep(.q-field__control) {
  border-radius: 50px;
}
.role-badge {
  font-size: 11px;
  letter-spacing: 0.5px;
  font-weight: 800;
  text-transform: uppercase;
}
.role-filter-chip {
  transition: all 0.2s ease;
  font-size: 12px;
}
.modern-dialog {
  border-radius: 20px;
  overflow: hidden;
}
.modern-input :deep(.q-field__control) {
  border-radius: 8px;
}
</style>
