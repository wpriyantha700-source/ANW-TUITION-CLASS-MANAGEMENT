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
          to="/"
          class="absolute-top-left q-ma-md"
          aria-label="Back to Home"
        />

        <q-card class="auth-card shadow-24" style="width: 100%; max-width: 450px">
          <q-card-section class="bg-black text-white text-center q-py-lg">
            <div class="text-h5 text-weight-bold">Create Account</div>
            <div class="text-caption text-grey-4">Join ANW Systems today</div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-form @submit="handleRegister" class="q-gutter-md">
              <!-- Name Field (Optional metadata) -->
              <q-input
                v-model="fullName"
                label="Full Name"
                filled
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || 'Please enter your name']"
              />

              <q-input
                v-model="email"
                label="Email Address"
                filled
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || 'Please enter your email']"
              />

              <q-input
                v-model="password"
                label="Password"
                type="password"
                filled
                lazy-rules
                :rules="[
                  (val) => (val && val.length >= 6) || 'Password must be at least 6 characters',
                ]"
              />

              <q-input
                v-model="confirmPassword"
                label="Confirm Password"
                type="password"
                filled
                lazy-rules
                :rules="[(val) => val === password || 'Passwords do not match']"
              />

              <q-input
                v-model="instituteName"
                label="Tuition Class / Institute Name"
                filled
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || 'Please enter institute name']"
                hint="Example: Silva Science Academy"
              />

              <q-input
                v-model="licenseKey"
                label="License Key"
                filled
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || 'Please enter license key']"
                hint="Enter the license key provided by ANW Systems"
              />

              <div class="column q-gutter-y-md q-mt-lg">
                <q-btn
                  label="Create My Institute Account"
                  type="submit"
                  color="black"
                  size="lg"
                  rounded
                  unelevated
                  class="full-width text-weight-bold"
                  :loading="loading"
                />

                <div class="text-center text-grey-8">
                  Already have an account?
                  <q-btn
                    flat
                    no-caps
                    color="primary"
                    label="Log In"
                    to="/login"
                    class="text-weight-bold"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const router = useRouter()
const $q = useQuasar()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const instituteName = ref('')
const licenseKey = ref('')
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  try {
    // 0. Validate License Key First (Check if it exists and is active)
    const { data: isValidLicense, error: licenseCheckError } = await supabase.rpc(
      'check_license_key',
      { lookup_key: licenseKey.value },
    )

    if (licenseCheckError) throw licenseCheckError

    if (!isValidLicense) {
      $q.notify({
        type: 'negative',
        message: 'Invalid or Expired License Key. Please contact admin.',
        position: 'top',
      })
      loading.value = false
      return
    }

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
        },
      },
    })

    if (authError) throw authError

    const userId = authData.user?.id

    if (userId) {
      // 2. Create Institute Record linked to this owner
      // The database trigger 'on_institute_created' will automatically:
      // - Validate the key again
      // - Mark it as 'used' in the license_keys table
      const slug = instituteName.value.toLowerCase().replace(/ /g, '-')
      const { error: instError } = await supabase.from('institutes').insert([
        {
          name: instituteName.value,
          slug: slug + '-' + Math.random().toString(36).substr(2, 5),
          owner_id: userId,
          license_key: licenseKey.value,
        },
      ])

      if (instError) throw instError
    }

    $q.dialog({
      title: 'Registration Successful!',
      message:
        'We have sent a confirmation email to ' +
        email.value +
        '.<br/><br/>Please check your inbox to activate your account and set up your institute.',
      html: true,
      persistent: true,
      ok: {
        label: 'Go to Login',
        color: 'black',
      },
    }).onOk(() => {
      router.push('/login')
    })
  } catch (error) {
    console.error('Registration error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Registration failed',
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
