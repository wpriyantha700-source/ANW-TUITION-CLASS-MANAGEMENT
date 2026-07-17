<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-white">
        <!-- Home Button -->
        <q-btn
          flat
          round
          icon="arrow_back"
          color="black"
          to="/login"
          class="absolute-top-left q-ma-md"
          aria-label="Back to Login"
        />

        <q-card class="auth-card shadow-24" style="width: 100%; max-width: 400px">
          <q-card-section class="bg-black text-white text-center q-py-lg">
            <div class="text-h5 text-weight-bold">Update Password</div>
            <div class="text-caption text-grey-4">Enter your new password below</div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-form @submit="handleUpdatePassword" class="q-gutter-md">
              <q-input
                v-model="newPassword"
                label="New Password"
                type="password"
                filled
                lazy-rules
                :rules="[
                  (val) => (val && val.length >= 6) || 'Password must be at least 6 characters',
                ]"
              />

              <q-input
                v-model="confirmPassword"
                label="Confirm New Password"
                type="password"
                filled
                lazy-rules
                :rules="[(val) => val === newPassword || 'Passwords do not match']"
              />

              <div class="column q-gutter-y-md q-mt-sm">
                <q-btn
                  label="Update Password"
                  type="submit"
                  color="black"
                  size="lg"
                  rounded
                  unelevated
                  class="full-width text-weight-bold"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const router = useRouter()
const $q = useQuasar()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

onMounted(() => {
  // Supabase automatically handles the recovery token from the URL
  // but we should verify we have a session or the context is right
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      console.log('Password recovery mode active')
    }
  })
})

const handleUpdatePassword = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Password updated successfully!',
      position: 'top',
    })

    // After password update, log the user out and send to login
    await supabase.auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Update Password error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update password.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
