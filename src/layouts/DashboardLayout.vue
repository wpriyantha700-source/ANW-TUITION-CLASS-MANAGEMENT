<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <!-- Top Bar -->
    <q-header class="bg-white text-grey-9 shadow-1 no-print" height-hint="64">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-subtitle1 text-weight-bold flex items-center">
          <q-avatar size="32px" v-if="instituteLogo" class="q-mr-sm">
            <img :src="instituteLogo" />
          </q-avatar>
          <span class="q-ml-sm">{{ instituteName }}</span>
        </q-toolbar-title>

        <q-space />

        <!-- Search (Hidden on small screens) -->
        <div class="gt-xs q-mr-md relative-position">
          <q-input
            dense
            outlined
            rounded
            placeholder="Search students..."
            v-model="search"
            class="search-input"
            bg-color="grey-1"
            @keyup.enter="handleGlobalSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" class="text-grey-5" />
            </template>
          </q-input>
        </div>

        <!-- Icons -->
        <q-btn flat dense round icon="notifications_none" class="q-mr-sm">
          <q-badge color="red" floating floating-transparent rounded>{{
            notifications.length
          }}</q-badge>
          <q-menu>
            <q-list style="min-width: 300px">
              <q-item-label header class="text-weight-bold">Notifications</q-item-label>
              <q-separator />
              <div v-if="notifications.length > 0">
                <q-item clickable v-ripple v-for="notif in notifications" :key="notif.id">
                  <q-item-section avatar>
                    <q-avatar
                      :color="notif.color"
                      text-color="white"
                      :icon="notif.icon"
                      size="sm"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ notif.title }}</q-item-label>
                    <q-item-label caption lines="2">{{ notif.message }}</q-item-label>
                    <q-item-label caption class="text-grey-5 text-right q-mt-xs">{{
                      notif.time
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup class="text-center">
                  <q-item-section class="text-primary">View All Notifications</q-item-section>
                </q-item>
              </div>
              <div v-else class="q-pa-md text-center text-grey-6">No new notifications</div>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- Logout Button (Mobile) -->
        <q-btn
          flat
          dense
          round
          color="red-7"
          icon="logout"
          class="lt-sm q-mx-sm"
          @click="handleLogout"
        />

        <!-- Logout Button (Visible on Desktop) -->
        <q-btn
          flat
          dense
          no-caps
          color="red-7"
          icon="logout"
          label="Log Out"
          class="gt-xs q-mx-sm text-weight-bold"
          @click="handleLogout"
        />

        <q-btn flat round class="q-ml-sm">
          <q-avatar size="36px">
            <img :src="userAvatar || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup to="/dashboard/profile">
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/dashboard/settings">
                <q-item-section>Settings</q-item-section>
              </q-item>
              <q-item
                v-if="isSuperAdmin"
                clickable
                v-close-popup
                to="/dashboard/master/licenses"
                class="text-indigo-7"
              >
                <q-item-section>License Master (Admin)</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section class="text-red">Log Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white text-grey-9 no-print"
      :width="260"
    >
      <div class="q-pa-md flex flex-center q-mb-md">
        <div class="text-h6 text-weight-bolder tracking-wide">DASHBOARD</div>
      </div>

      <q-list padding class="text-grey-7">
        <q-item-label header class="text-uppercase text-caption text-weight-bold q-mb-sm q-pl-md">
          Main
        </q-item-label>

        <q-item
          v-for="link in mainLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.to"
          active-class="bg-grey-2 text-primary text-weight-bold"
          class="rounded-borders q-mx-sm q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.title }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md q-mx-lg" color="grey-2" />

        <q-item-label header class="text-uppercase text-caption text-weight-bold q-mb-sm q-pl-md">
          Management
        </q-item-label>
        <q-item
          v-for="link in managementLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.to"
          active-class="bg-grey-2 text-primary text-weight-bold"
          class="rounded-borders q-mx-sm q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.title }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md q-mx-lg" color="grey-2" />

        <q-item-label header class="text-uppercase text-caption text-weight-bold q-mb-sm q-pl-md">
          Academic Evaluation
        </q-item-label>
        <q-item
          v-for="link in academicLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.to"
          active-class="bg-grey-2 text-primary text-weight-bold"
          class="rounded-borders q-mx-sm q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.title }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md q-mx-lg" color="grey-2" />

        <q-item-label header class="text-uppercase text-caption text-weight-bold q-mb-sm q-pl-md">
          Administration
        </q-item-label>
        <q-item
          v-for="link in adminLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.to"
          active-class="bg-grey-2 text-primary text-weight-bold"
          class="rounded-borders q-mx-sm q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.title }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md q-mx-lg" color="grey-2" />

        <q-item
          clickable
          v-ripple
          @click="handleLogout"
          class="rounded-borders q-mx-sm text-red text-weight-bold"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout / Login Page</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- Expiry Warning Banner -->
      <q-banner v-if="isExpiringSoon && !isExpired" class="bg-orange-1 text-orange-9 q-ma-md rounded-borders shadow-1">
        <template v-slot:avatar>
          <q-icon name="warning" color="orange" />
        </template>
        Your license is expiring in {{ daysToExpiry }} days. Please renew soon to avoid service interruption.
        <template v-slot:action>
          <q-btn flat color="orange-9" label="Renew Now" to="/dashboard/settings" />
        </template>
      </q-banner>

      <router-view :key="$route.fullPath" />
    </q-page-container>

    <!-- License Expired Blocking Dialog -->
    <q-dialog v-model="showBlockingOverlay" persistent maximized transition-show="fade" transition-hide="fade">
      <q-card class="bg-white flex flex-center">
        <div class="column items-center q-pa-xl text-center" style="max-width: 500px">
          <q-avatar size="100px" font-size="50px" color="red-1" text-color="red-7" icon="lock_person" class="q-mb-lg" />
          <h2 class="text-h4 text-weight-bolder text-slate-900 q-ma-none">Access Denied</h2>
          <div class="text-subtitle1 text-slate-500 q-mt-md">
            Your institution's license has expired. Please enter a new license key to restore access to your dashboard.
          </div>

          <q-card flat bordered class="full-width q-mt-xl q-pa-lg rounded-borders bg-grey-1">
            <q-input
              v-model="renewKey"
              label="Enter License Key"
              outlined
              bg-color="white"
              placeholder="ANW-XXXX-XXXX-XXXX"
              :loading="renewing"
              @keyup.enter="handleFullRenew"
            />
            <q-btn
              label="Activate License Now"
              color="indigo-10"
              unelevated
              rounded
              class="full-width q-mt-md q-py-sm"
              @click="handleFullRenew"
              :loading="renewing"
            />
          </q-card>

          <div class="q-mt-xl">
            <q-btn flat no-caps color="grey-7" label="Log Out" icon="logout" @click="handleLogout" />
            <q-btn flat no-caps color="primary" label="Contact Support" class="q-ml-md" />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const leftDrawerOpen = ref(false)
const search = ref('')
const router = useRouter()
const $q = useQuasar()

import { useUserStore } from 'src/stores/userStore'
import { computed } from 'vue'

const userStore = useUserStore()
const userAvatar = computed(() => userStore.user?.user_metadata?.avatar_url || '')
const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition')
const instituteLogo = computed(() => userStore.institute?.logo_url || '')

// Super Admin Check (Owner of the whole system)
const isSuperAdmin = computed(() => {
  const superAdminEmails = ['wpriyantha700@gmail.com', 'admin@anw.com', 'priyantha12@gmail.com']
  return userStore.user && superAdminEmails.includes(userStore.user.email)
})

const isExpired = computed(() => {
  if (isSuperAdmin.value) return false
  if (!userStore.institute?.license_expiry) return false // Assume trial or manually set if null
  return new Date(userStore.institute.license_expiry) < new Date()
})

const daysToExpiry = computed(() => {
  if (!userStore.institute?.license_expiry) return 999
  const expiry = new Date(userStore.institute.license_expiry)
  const diffTime = expiry - new Date()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const isExpiringSoon = computed(() => {
  return daysToExpiry.value > 0 && daysToExpiry.value <= 7
})

const showBlockingOverlay = computed(() => isExpired.value)
const renewKey = ref('')
const renewing = ref(false)

const handleFullRenew = async () => {
  if (!renewKey.value.trim()) return
  renewing.value = true
  try {
    const res = await userStore.renewLicense(renewKey.value.trim())
    $q.notify({ type: 'positive', message: res.message })
    renewKey.value = ''
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Renewal failed' })
  } finally {
    renewing.value = false
  }
}

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchSession()
  }
})

const handleGlobalSearch = () => {
  const query = search.value.trim()
  if (!query) return

  const lowerQuery = query.toLowerCase()
  // Check for payment-related keywords
  if (
    lowerQuery.includes('incomplete') ||
    lowerQuery.includes('due') ||
    lowerQuery.includes('pending') ||
    lowerQuery.includes('unpaid')
  ) {
    router.push({ path: '/dashboard/fees', query: { tab: 'pending' } })
  } else {
    // Default to student search
    router.push({
      path: '/dashboard/students',
      query: { q: query },
    })
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleLogout = () => {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to log out?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Log Out',
      color: 'red',
      flat: true,
    },
  }).onOk(async () => {
    $q.loading.show({
      message: 'Logging out...',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
    })

    try {
      await supabase.auth.signOut()
      // Brief delay for better UX
      setTimeout(() => {
        router.push('/login')
        $q.loading.hide()
        $q.notify({
          type: 'positive',
          message: 'Logged out successfully',
        })
      }, 800)
    } catch (error) {
      $q.loading.hide()
      console.error('Logout error:', error)
      router.push('/login')
    }
  })
}

const mainLinks = [
  { title: 'Overview', icon: 'dashboard', to: '/dashboard' },
  { title: 'Profile', icon: 'person', to: '/dashboard/profile' },
]

const managementLinks = [
  { title: 'Student Directory', icon: 'school', to: '/dashboard/students' },
  { title: 'Register Student', icon: 'person_add', to: '/dashboard/students/register' },
  { title: 'Class Management', icon: 'class', to: '/dashboard/classes' },
  { title: 'Weekly Timetable', icon: 'event_note', to: '/dashboard/schedule' },
  { title: 'Attendance Tracking', icon: 'fact_check', to: '/dashboard/attendance' },
  { title: 'Attendance Reports', icon: 'analytics', to: '/dashboard/attendance/reports' },
  { title: 'Fee Collection', icon: 'payments', to: '/dashboard/fees' },
  { title: 'Broadcast & News', icon: 'campaign', to: '/dashboard/communication' },
]

const academicLinks = [
  { title: 'Subject Materials', icon: 'folder_shared', to: '/dashboard/materials' },
  { title: 'Results Management', icon: 'auto_graph', to: '/dashboard/results' },
  { title: 'Academic Certificates', icon: 'workspace_premium', to: '/dashboard/certificates' },
]

const adminLinks = computed(() => {
  const links = [
    { title: 'Users Management', icon: 'people', to: '/dashboard/users' },
    { title: 'Roles & Permissions', icon: 'security', to: '/dashboard/roles' },
    { title: 'Audit Logs', icon: 'history_edu', to: '/dashboard/audit-logs' },
    { title: 'Institute Profile', icon: 'settings', to: '/dashboard/settings' },
  ]

  if (isSuperAdmin.value) {
    links.push({
      title: 'License Master',
      icon: 'vpn_key',
      to: '/dashboard/master/licenses',
    })
  }

  return links
})
const notifications = ref([
  {
    id: 1,
    title: 'New Student Registered',
    message: 'Sandamali Silva has joined the Grade 10 Science class.',
    time: '2 mins ago',
    icon: 'person_add',
    color: 'green',
  },
  {
    id: 2,
    title: 'Payment Received',
    message: 'Fees received from Kamal Perera for January.',
    time: '1 hour ago',
    icon: 'payments',
    color: 'blue',
  },
  {
    id: 3,
    title: 'Class Cancelled',
    message: "Tonight's Math class has been cancelled due to weather.",
    time: '5 hours ago',
    icon: 'event_busy',
    color: 'red',
  },
])
</script>

<style scoped lang="scss">
.search-input {
  width: 300px;
  .q-field__control {
    height: 40px;
  }
}

@media print {
  .q-header,
  .q-drawer,
  .q-btn,
  .q-footer {
    display: none !important;
  }

  .q-page-container {
    padding-left: 0 !important;
    padding-top: 0 !important;
    margin: 0 !important;
  }

  .q-layout {
    min-height: auto !important;
    background: white !important;
    background-color: white !important;
  }
}
</style>
