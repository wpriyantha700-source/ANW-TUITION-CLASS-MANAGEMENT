<template>
  <q-page class="q-pa-md bg-stone">
    <div class="row q-col-gutter-lg justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Header Section -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-auto">
            <h1 class="text-h4 text-weight-bolder q-ma-none text-slate-900 tracking-tight">
              Institute Profile
            </h1>
            <p class="text-subtitle1 text-slate-500 q-mt-xs">
              Manage your institution's public identity and branding
            </p>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
            <q-btn
              label="View Public Page"
              icon="open_in_new"
              outline
              color="primary"
              rounded
              class="q-px-lg"
              :to="`/i/${instForm.slug}`"
              target="_blank"
            />
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <!-- Left Column: Branding & Quick Stats -->
          <div class="col-12 col-md-4">
            <q-card flat class="branding-card shadow-sm border-slate-200">
              <q-card-section class="text-center q-pa-xl">
                <div class="relative-position inline-block">
                  <q-avatar size="140px" class="shadow-md border-4 border-white overflow-hidden">
                    <img v-if="instForm.logo_url" :src="instForm.logo_url" class="object-cover" />
                    <div v-else class="full-width full-height bg-slate-100 flex flex-center">
                      <q-icon name="apartment" size="64px" color="slate-300" />
                    </div>
                  </q-avatar>
                  <q-btn
                    round
                    color="primary"
                    icon="photo_camera"
                    size="sm"
                    class="absolute-bottom-right shadow-lg"
                    @click="triggerLogoUpload"
                  >
                    <q-tooltip>Update Logo</q-tooltip>
                  </q-btn>
                  <input
                    type="file"
                    ref="logoInput"
                    class="hidden"
                    accept="image/*"
                    @change="handleLogoChange"
                  />
                </div>
                <div class="text-h6 text-weight-bold q-mt-lg text-slate-900">
                  {{ instForm.name }}
                </div>
                <q-badge
                  :label="instForm.license_key !== 'N/A' ? 'Verified Partner' : 'Standard Plan'"
                  :color="instForm.license_key !== 'N/A' ? 'indigo-1' : 'slate-100'"
                  :text-color="instForm.license_key !== 'N/A' ? 'indigo-9' : 'slate-600'"
                  class="q-px-md q-py-xs text-weight-bold q-mt-sm"
                />
              </q-card-section>

              <q-separator inset />

              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="text-caption text-slate-400 uppercase text-weight-bold">
                      Unique Handle
                    </div>
                    <div class="text-subtitle2 text-slate-700">@{{ instForm.slug }}</div>
                  </div>
                  <div class="col-12 q-mt-md">
                    <div class="text-caption text-slate-400 uppercase text-weight-bold">
                      Registration Key
                    </div>
                    <div class="text-subtitle2 font-mono text-slate-700">
                      {{ instForm.license_key }}
                    </div>
                  </div>
                  <div class="col-12 q-mt-md">
                    <div class="text-caption text-slate-400 uppercase text-weight-bold">
                      License Expiry
                    </div>
                    <div
                      class="text-subtitle2 text-slate-700 flex items-center"
                      :class="{ 'text-red text-weight-bold': isExpired }"
                    >
                      {{ formatDate(userStore.institute?.license_expiry) }}
                      <q-badge v-if="isExpired" color="red" label="EXPIRED" class="q-ml-sm" />
                    </div>
                    <q-btn
                      label="Renew License"
                      color="primary"
                      unelevated
                      rounded
                      dense
                      size="sm"
                      icon="autorenew"
                      class="q-mt-sm q-px-md"
                      @click="showRenewDialog = true"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right Column: Settings Form -->
          <div class="col-12 col-md-8">
            <q-card flat class="form-card shadow-sm border-slate-200">
              <q-tabs
                v-model="activeTab"
                dense
                class="text-slate-500 bg-slate-50"
                active-color="primary"
                indicator-color="primary"
                align="left"
                narrow-indicator
              >
                <q-tab name="general" label="General" />
                <q-tab name="contact" label="Contact & Social" />
                <q-tab name="security" label="Security" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="activeTab" animated class="q-pa-none">
                <!-- General Settings -->
                <q-tab-panel name="general" class="q-pa-xl">
                  <q-form @submit="saveSettings" class="q-gutter-y-lg">
                    <div class="section-title text-subtitle1 text-weight-bold text-slate-900">
                      Institution Details
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12">
                        <q-input
                          v-model="instForm.name"
                          label="Full Institute Name"
                          stack-label
                          outlined
                          color="primary"
                          :rules="[(val) => !!val || 'Name is required']"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="instForm.address"
                          label="Physical Address"
                          stack-label
                          outlined
                          type="textarea"
                          rows="3"
                          color="primary"
                          placeholder="No, Street, City, ZIP"
                        />
                      </div>
                    </div>

                    <div class="row justify-end q-mt-xl q-pb-md">
                      <q-btn
                        label="Save Institute Details"
                        type="submit"
                        color="primary"
                        unelevated
                        rounded
                        class="q-px-xl"
                        style="min-height: 44px"
                        :loading="loading"
                      />
                    </div>
                  </q-form>
                </q-tab-panel>

                <!-- Contact & Social -->
                <q-tab-panel name="contact" class="q-pa-xl">
                  <q-form @submit="saveSettings" class="q-gutter-y-lg">
                    <div class="section-title text-subtitle1 text-weight-bold text-slate-900">
                      Communication Channels
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="instForm.phone"
                          label="Contact Phone"
                          stack-label
                          outlined
                          color="primary"
                          mask="##########"
                          placeholder="07XXXXXXXX"
                        >
                          <template v-slot:prepend><q-icon name="phone" /></template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="instForm.email"
                          label="Inquiry Email"
                          stack-label
                          outlined
                          color="primary"
                          type="email"
                          placeholder="info@institute.com"
                        >
                          <template v-slot:prepend><q-icon name="email" /></template>
                        </q-input>
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="instForm.website"
                          label="Website / Facebook URL"
                          stack-label
                          outlined
                          color="primary"
                          placeholder="https://..."
                        >
                          <template v-slot:prepend><q-icon name="language" /></template>
                        </q-input>
                      </div>
                    </div>

                    <div class="row justify-end q-mt-xl q-pb-md">
                      <q-btn
                        label="Update Contact Info"
                        type="submit"
                        color="primary"
                        unelevated
                        rounded
                        class="q-px-xl"
                        style="min-height: 44px"
                        :loading="loading"
                      />
                    </div>
                  </q-form>
                </q-tab-panel>

                <!-- Security Settings -->
                <q-tab-panel name="security" class="q-pa-xl">
                  <div class="section-title text-subtitle1 text-weight-bold text-slate-900 q-mb-md">
                    Account Protection
                  </div>

                  <q-list bordered separator class="rounded-borders">
                    <q-item class="q-py-md">
                      <q-item-section avatar>
                        <q-icon name="lock" color="slate-400" size="md" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Password Reset</q-item-label>
                        <q-item-label caption>
                          Send a recovery link to {{ userStore.user?.email }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          label="Request Reset"
                          outline
                          color="primary"
                          rounded
                          size="sm"
                          @click="sendPasswordReset"
                          :loading="loadingReset"
                        />
                      </q-item-section>
                    </q-item>

                    <q-item class="q-py-md">
                      <q-item-section avatar>
                        <q-icon name="palette" color="slate-400" size="md" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">System Appearance</q-item-label>
                        <q-item-label caption>Toggle high-contrast Dark Mode</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle v-model="darkMode" color="primary" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <!-- Renew License Dialog -->
    <q-dialog v-model="showRenewDialog">
      <q-card style="width: 400px; border-radius: 16px">
        <q-card-section class="bg-primary text-white row items-center q-pa-md">
          <div class="text-h6">Renew License</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-body2 text-slate-600 q-mb-md">
            Enter a valid license key provided by ANW Systems to extend your institution's access.
          </div>
          <q-input
            v-model="newLicenseKey"
            label="New License Key"
            outlined
            placeholder="ANW-XXXX-XXXX-XXXX"
            class="q-mb-md"
            autofocus
            @keyup.enter="handleRenew"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-slate-50">
          <q-btn label="Cancel" flat color="slate-600" v-close-popup />
          <q-btn
            label="Renew Now"
            color="primary"
            unelevated
            rounded
            class="q-px-lg"
            @click="handleRenew"
            :loading="renewing"
            :disable="!newLicenseKey.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const userStore = useUserStore()

const activeTab = ref('general')
const loading = ref(false)
const loadingReset = ref(false)
const logoInput = ref(null)

const instForm = ref({
  name: '',
  slug: '',
  license_key: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  logo_url: '',
})

const darkMode = ref($q.dark.isActive)
const showRenewDialog = ref(false)
const newLicenseKey = ref('')
const renewing = ref(false)

const isExpired = computed(() => {
  if (!userStore.institute?.license_expiry) return true
  return new Date(userStore.institute.license_expiry) < new Date()
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'No Date Set'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  if (userStore.institute) {
    const inst = userStore.institute
    instForm.value = {
      name: inst.name || '',
      slug: inst.slug || '',
      license_key: inst.license_key || 'N/A',
      address: inst.address || '',
      phone: inst.phone || '',
      email: inst.email || '',
      website: inst.website || '',
      logo_url: inst.logo_url || '',
    }
  }
})

watch(darkMode, (val) => {
  $q.dark.set(val)
})

const triggerLogoUpload = () => {
  logoInput.value.click()
}

const handleLogoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  $q.loading.show({ message: 'Uploading logo...' })
  try {
    const url = await userStore.uploadInstituteLogo(file)
    instForm.value.logo_url = url
    $q.notify({ type: 'positive', message: 'Logo updated successfully!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Logo upload failed: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

const saveSettings = async () => {
  loading.value = true
  try {
    await userStore.updateInstitute({
      name: instForm.value.name,
      address: instForm.value.address,
      phone: instForm.value.phone,
      email: instForm.value.email,
      website: instForm.value.website,
    })
    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully!',
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Update failed: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

const sendPasswordReset = async () => {
  loadingReset.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(userStore.user.email, {
      redirectTo: window.location.origin + '/update-password',
    })
    if (error) throw error
    $q.notify({
      type: 'positive',
      message: 'Recovery link sent to ' + userStore.user.email,
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error: ' + error.message })
  } finally {
    loadingReset.value = false
  }
}

const handleRenew = async () => {
  if (!newLicenseKey.value.trim()) return

  renewing.value = true
  try {
    const result = await userStore.renewLicense(newLicenseKey.value.trim())
    $q.notify({
      type: 'positive',
      message: result.message,
      icon: 'verified',
    })
    showRenewDialog.value = false
    newLicenseKey.value = ''

    // Update the form display
    instForm.value.license_key = userStore.institute.license_key
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Renewal failed',
      position: 'top',
    })
  } finally {
    renewing.value = false
  }
}
</script>

<style scoped>
.bg-stone {
  background-color: #f8fafc;
}
.branding-card,
.form-card {
  border-radius: 24px;
  overflow: hidden;
}
.section-title {
  border-left: 4px solid var(--q-primary);
  padding-left: 12px;
}
.q-tab-panel {
  min-height: 450px;
}
.hidden {
  display: none;
}
/* Premium subtle shadows */
.shadow-sm {
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}
.border-slate-200 {
  border: 1px solid #e2e8f0;
}
</style>
