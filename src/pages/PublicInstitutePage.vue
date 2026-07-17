<template>
  <div class="public-page-wrapper bg-stone text-slate-900 min-vh-100">
    <div v-if="loading" class="flex flex-center fixed-full bg-white z-top">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="!institute" class="flex flex-center column q-pa-xl text-center">
      <q-icon name="error_outline" size="100px" color="grey-3" />
      <h2 class="text-h4 text-weight-bold text-grey-7">Institute Not Found</h2>
      <p class="text-subtitle1 text-grey-5">We couldn't find a page for this handle.</p>
      <q-btn label="Go Home" color="primary" to="/" flat class="q-mt-lg" />
    </div>

    <div v-else>
      <!-- Hero -->
      <header class="hero bg-indigo-10 text-white q-pa-xl">
        <div class="row items-center q-col-gutter-lg max-content q-mx-auto">
          <div class="col-12 col-md-auto">
            <q-avatar size="140px" class="shadow-10 border-white">
              <img v-if="institute.logo_url" :src="institute.logo_url" />
              <q-icon v-else name="apartment" size="64px" />
            </q-avatar>
          </div>
          <div class="col-12 col-md text-center text-md-left">
            <h1 class="text-h2 text-weight-bolder q-ma-none h-tight">{{ institute.name }}</h1>
            <div class="row q-gutter-md justify-center justify-md-start items-center q-mt-sm">
              <q-badge color="white" text-color="indigo-10" class="text-weight-bold q-px-md"
                >OFFICIAL PARTNER</q-badge
              >
              <div v-if="institute.address" class="text-subtitle1 opacity-80 flex items-center">
                <q-icon name="place" size="xs" class="q-mr-xs" /> {{ institute.address }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-content q-mx-auto q-pa-md q-mt-xl">
        <div class="row q-col-gutter-xl">
          <!-- Sidebar -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="q-pa-lg rounded-2xl shadow-sm bg-white">
              <div class="text-h6 text-weight-bold q-mb-lg flex items-center">
                <q-icon name="contacts" color="primary" class="q-mr-sm" />
                Contact Info
              </div>
              <q-list padding class="q-gutter-y-sm">
                <q-item v-if="institute.phone">
                  <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Call</q-item-label>
                    <q-item-label class="text-weight-bold">{{ institute.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="institute.email">
                  <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label class="text-weight-bold">{{ institute.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="institute.website">
                  <q-item-section avatar><q-icon name="language" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Website</q-item-label>
                    <q-item-label
                      class="text-weight-bold text-primary cursor-pointer truncate"
                      @click="openLink(institute.website)"
                    >
                      {{ institute.website }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-btn
                label="Contact Now"
                color="indigo-9"
                unelevated
                rounded
                class="full-width q-mt-xl py-3"
                v-if="institute.phone"
                :href="`tel:${institute.phone}`"
              />
            </q-card>
          </div>

          <!-- Classes -->
          <div class="col-12 col-md-8">
            <h3 class="text-h5 text-weight-bold q-mt-none q-mb-lg text-slate-900">
              Available Classes
            </h3>

            <div
              v-if="classes.length === 0"
              class="text-center q-pa-xl bg-white border-dashed rounded-2xl"
            >
              <q-icon name="event_busy" size="64px" color="grey-3" />
              <div class="text-grey-5 q-mt-md">No classes are publicly listed right now.</div>
            </div>

            <div v-else class="row q-col-gutter-lg">
              <div v-for="cls in classes" :key="cls.id" class="col-12 col-sm-6">
                <q-card
                  flat
                  bordered
                  class="rounded-2xl hover-shadow h-full bg-white transition-all"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="row justify-between items-center q-mb-sm">
                      <q-badge color="indigo-1" text-color="indigo-9" class="text-weight-bold">
                        {{ cls.grade }}
                      </q-badge>
                      <div class="text-caption text-slate-400">
                        {{ cls.day || cls.schedule.split(' ')[0] }}
                      </div>
                    </div>
                    <div class="text-h6 text-weight-bold text-slate-900 q-mb-xs">
                      {{ cls.name }}
                    </div>
                    <div class="text-body2 text-slate-500 q-mb-md">By {{ cls.teacher }}</div>
                    <div class="row justify-between items-center bg-slate-50 q-pa-sm rounded-lg">
                      <div class="text-caption text-slate-500">
                        <q-icon name="schedule" size="xs" /> {{ cls.start_time || '' }} -
                        {{ cls.end_time || '' }}
                      </div>
                      <div class="text-weight-bolder text-green-7">
                        Rs. {{ cls.fee?.toLocaleString() }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="q-pa-xl text-center bg-slate-900 text-white q-mt-2xl">
        <div class="text-subtitle2 opacity-50 q-mb-md">ANW Tuition Management System</div>
        <div class="text-caption opacity-30">
          © {{ new Date().getFullYear() }} {{ institute.name }}. All rights reserved.
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const route = useRoute()
const loading = ref(true)
const institute = ref(null)
const classes = ref([])

onMounted(async () => {
  const slug = route.params.slug
  if (!slug) {
    loading.value = false
    return
  }

  try {
    const { data: inst, error } = await supabase
      .from('institutes')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (!error && inst) {
      institute.value = inst
      const { data: clsList } = await supabase
        .from('classes')
        .select('*')
        .eq('institute_id', inst.id)
        .eq('is_active', true)
      classes.value = clsList || []
    }
  } catch (err) {
    console.error('Public Page Error:', err)
  } finally {
    loading.value = false
  }
})

function openLink(url) {
  if (!url) return
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  window.open(fullUrl, '_blank')
}
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.max-content {
  max-width: 1100px;
}
.fixed-full {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.z-top {
  z-index: 9999;
}
.bg-stone {
  background-color: #f8fafc;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.bg-slate-900 {
  background-color: #0f172a;
}
.hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
}
.rounded-2xl {
  border-radius: 1.5rem;
}
.h-tight {
  line-height: 1;
}
.border-white {
  border: 4px solid rgba(255, 255, 255, 0.2);
}
.border-dashed {
  border: 2px dashed #e2e8f0;
}
.text-slate-900 {
  color: #0f172a;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-400 {
  color: #94a3b8;
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>
