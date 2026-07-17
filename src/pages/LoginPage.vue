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

        <q-card class="auth-card shadow-24" style="width: 100%; max-width: 400px">
          <q-card-section class="bg-black text-white text-center q-py-lg">
            <div class="text-h5 text-weight-bold">Log In</div>
            <div class="text-caption text-grey-4">Welcome back to ANW Systems</div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-form @submit="handleLogin" class="q-gutter-md">
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
                :rules="[(val) => (val && val.length > 0) || 'Please enter your password']"
              />

              <div class="row justify-end">
                <q-btn
                  flat
                  dense
                  no-caps
                  label="Forgot Password?"
                  class="text-grey-7"
                  size="sm"
                  @click="handleForgotPassword"
                />
              </div>

              <div class="column q-gutter-y-md q-mt-sm">
                <q-btn
                  label="Log In"
                  type="submit"
                  color="black"
                  size="lg"
                  rounded
                  unelevated
                  class="full-width text-weight-bold"
                  :loading="loading"
                />

                <div class="text-center text-grey-8">
                  Don't have an account?
                  <q-btn
                    flat
                    no-caps
                    color="primary"
                    label="Register"
                    to="/register"
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

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  console.log('Attempting login for:', email.value)
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      // If it's an email not confirmed error, let them in anyway for development/testing
      // if (error.message.includes('Email not confirmed')) {
      //   $q.notify({ type: 'warning', message: 'Email not confirmed, but letting you in for testing!' })
      //   router.push('/dashboard')
      //   return
      // }
      throw error
    }

    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top',
    })

    router.push('/dashboard')
  } catch (error) {
    console.error('Detailed Login Error:', error)

    let msg = error.message || 'Login failed.'

    if (msg.includes('Invalid login credentials')) {
      msg = 'Invalid email or password. Please try again.'
    } else if (msg.includes('Email not confirmed')) {
      msg = 'Email not confirmed. Please check your inbox or try a different account.'
    }

    $q.notify({
      type: 'negative',
      message: msg,
      position: 'top',
      icon: 'error',
      timeout: 5000,
    })
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    $q.notify({
      type: 'warning',
      message: 'Please enter your email address first.',
      position: 'top',
    })
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: window.location.origin + '/update-password',
    })

    if (error) throw error

    $q.dialog({
      title: 'Check your email',
      message: 'We have sent a password reset link to ' + email.value,
      persistent: true,
      // ok: 'OK'
    })
  } catch (error) {
    console.error('Reset Password error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to send reset email.',
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
