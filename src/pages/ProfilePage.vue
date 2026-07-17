<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row q-col-gutter-md justify-center">
      <!-- Profile Content Container -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-gutter-md">
              <div class="column items-center">
                <q-avatar size="100px" class="shadow-2 q-mb-sm">
                  <img :src="profile.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
                </q-avatar>

                <q-file
                  v-model="tempFile"
                  label="Select Image"
                  outlined
                  dense
                  accept="image/*"
                  style="max-width: 200px"
                  bg-color="white"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                </q-file>

                <q-btn
                  v-if="tempFile"
                  label="UPLOAD NOW"
                  color="green"
                  unelevated
                  size="sm"
                  class="full-width"
                  icon="cloud_upload"
                  @click="handleManualUpload"
                />
              </div>

              <div class="col">
                <div class="text-h5 text-weight-bold">{{ profile.full_name || 'Loading...' }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ profile.email || 'user@example.com' }}
                </div>
                <!-- ... removed redundant chip for brevity if needed, but let's keep it complete if possible -->
                <q-chip
                  dense
                  color="green-1"
                  text-color="green-9"
                  icon="verified"
                  label="Admin Account"
                  class="q-mt-xs"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">Personal Information</div>

            <q-form @submit="updateProfile" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.full_name"
                    label="Full Name"
                    outlined
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.email"
                    label="Email Address"
                    outlined
                    dense
                    bg-color="grey-2"
                    readonly
                    hint="Email cannot be changed"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.phone"
                    label="Phone Number"
                    outlined
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.role"
                    label="Role"
                    outlined
                    dense
                    bg-color="grey-2"
                    readonly
                  />
                </div>
              </div>

              <div class="row justify-end q-mt-lg">
                <q-btn label="Cancel" flat color="grey-8" class="q-mr-sm" />
                <q-btn
                  label="Save Changes"
                  type="submit"
                  color="black"
                  unelevated
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="rounded-borders q-mt-md">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold text-red-7 q-mb-sm">Danger Zone</div>
            <p class="text-grey-7">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <q-btn outline color="red" label="Delete Account" no-caps />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'src/boot/supabase'
import { useQuasar } from 'quasar'

import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const userStore = useUserStore()
const loading = ref(false)
const tempFile = ref(null)

const profile = ref({
  full_name: '',
  email: '',
  avatar_url: '',
})

const form = ref({
  full_name: '',
  email: '',
  phone: '',
  role: 'Administrator',
})

onMounted(async () => {
  await getProfile()
})

async function getProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      profile.value = {
        full_name: user.user_metadata.full_name || 'User',
        email: user.email,
        avatar_url: user.user_metadata.avatar_url || '',
      }

      form.value.full_name = user.user_metadata.full_name || ''
      form.value.email = user.email
      form.value.phone = user.user_metadata.phone || ''
    }
  } catch (error) {
    console.error('Error fetching profile', error)
  }
}

async function handleManualUpload() {
  if (!tempFile.value) return

  const fileSizeMB = tempFile.value.size / 1024 / 1024
  console.log('File selected:', tempFile.value.name, 'Size:', fileSizeMB.toFixed(2), 'MB')

  if (fileSizeMB > 5) {
    $q.dialog({
      title: 'File Too Large',
      message: `The selected file is ${fileSizeMB.toFixed(2)}MB. Please choose an image under 5MB.`,
      color: 'negative',
    })
    return
  }

  $q.loading.show({
    message: 'Uploading to cloud...',
    backgroundColor: 'black',
  })

  try {
    console.log('Calling uploadAvatar...')
    const finalUrl = await userStore.uploadAvatar(tempFile.value)
    console.log('Avatar uploaded, URL:', finalUrl)

    profile.value.avatar_url = finalUrl
    // Force refresh the image by appending timestamp if not already there (store does it, but purely for reactivity)
    profile.value.avatar_url = finalUrl

    tempFile.value = null // Clear the picker

    $q.notify({
      type: 'positive',
      message: 'Profile picture updated! It will reflect everywhere soon.',
      position: 'top',
    })
  } catch (error) {
    console.error('Manual Upload Error:', error)
    $q.dialog({
      title: 'Upload Failed',
      message: `Error: ${error.message || 'Unknown error'}. Check console for details.`,
      color: 'negative',
    })
  } finally {
    $q.loading.hide()
  }
}

async function updateProfile() {
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: form.value.full_name,
        phone: form.value.phone,
      },
    })

    if (error) throw error

    // Update local state
    profile.value.full_name = form.value.full_name

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully!',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Update failed: ' + error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
