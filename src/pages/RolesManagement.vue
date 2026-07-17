<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="q-mb-md flex justify-between items-center">
      <div class="text-h5 text-weight-bold grey-9">Roles & Permissions</div>
      <q-btn
        unelevated
        color="black"
        icon="add"
        label="Create New Role"
        rounded
        @click="openAddDialog"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="role in roles" :key="role.id" class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders h-full column">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">{{ role.name }}</div>
              <q-badge :color="role.color" class="q-px-sm">{{ role.userCount }} users</q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">{{ role.description }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="col-grow">
            <div class="text-weight-bold q-mb-xs">Permissions</div>
            <div class="flex q-gutter-xs">
              <q-chip
                v-for="perm in role.permissions"
                :key="perm"
                dense
                size="sm"
                outline
                color="grey-6"
              >
                {{ perm }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat dense round color="grey-7" icon="edit" size="sm" @click="openEditDialog(role)">
              <q-tooltip>Edit Role</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              color="red-5"
              icon="delete"
              size="sm"
              v-if="role.name !== 'Admin'"
              @click="confirmDelete(role)"
            >
              <q-tooltip>Delete Role</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Role Dialog (Add / Edit) -->
    <q-dialog v-model="showRoleDialog">
      <q-card style="min-width: 500px" class="rounded-borders">
        <q-card-section class="bg-black text-white">
          <div class="text-h6">{{ isEditMode ? 'Edit Role' : 'Create New Role' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveRole" class="q-gutter-md">
            <q-input
              v-model="roleForm.name"
              label="Role Name"
              outlined
              dense
              lazy-rules
              :rules="[val => !!val || 'Role name is required']"
            />

            <q-input
              v-model="roleForm.description"
              label="Description"
              outlined
              dense
              type="textarea"
              autogrow
            />

            <q-select
              v-model="roleForm.permissions"
              :options="availablePermissions"
              label="Select Permissions"
              outlined
              dense
              multiple
              use-chips
              stack-label
              option-value="value"
              option-label="label"
              emit-value
              map-options
            >
              <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                <q-item v-bind="itemProps">
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="row justify-end q-mt-lg">
              <q-btn label="Cancel" flat color="grey-8" v-close-popup class="q-mr-sm" />
              <q-btn
                :label="isEditMode ? 'Update Role' : 'Create Role'"
                color="black"
                unelevated
                type="submit"
                rounded
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRoleStore } from 'src/stores/roleStore'

const $q = useQuasar()
const roleStore = useRoleStore()

const showRoleDialog = ref(false)
const isEditMode = ref(false)
const editingId = ref(null)

const roles = computed(() => roleStore.roles)
const availablePermissions = computed(() => roleStore.availablePermissions)

const roleForm = reactive({
  name: '',
  description: '',
  permissions: []
})

const openAddDialog = () => {
  isEditMode.value = false
  editingId.value = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissions = []
  showRoleDialog.value = true
}

const openEditDialog = (role) => {
  isEditMode.value = true
  editingId.value = role.id
  roleForm.name = role.name
  roleForm.description = role.description
  // Ensure permissions array is copied to avoid reactivity issues with store state directly
  roleForm.permissions = [...role.permissions]
  showRoleDialog.value = true
}

const saveRole = () => {
  if (!roleForm.name) return

  if (isEditMode.value) {
    roleStore.updateRole(editingId.value, { ...roleForm })
    $q.notify({
      color: 'positive',
      message: 'Role updated successfully',
      icon: 'check_circle'
    })
  } else {
    roleStore.addRole({ ...roleForm })
    $q.notify({
      color: 'positive',
      message: 'New role created successfully',
      icon: 'check_circle'
    })
  }
  showRoleDialog.value = false
}

const confirmDelete = (role) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the role <b>${role.name}</b>?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'red',
      flat: true
    }
  }).onOk(() => {
    const success = roleStore.deleteRole(role.id)
    if (success) {
      $q.notify({
        color: 'positive',
        message: 'Role deleted successfully',
        icon: 'delete'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: 'Cannot delete Admin role or role not found',
        icon: 'warning'
      })
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.h-full {
  height: 100%;
}
</style>
