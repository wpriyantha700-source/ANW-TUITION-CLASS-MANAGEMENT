<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">Weekly Timetable</h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">Visual schedule of all tuition classes</p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none no-print">
        <q-btn-toggle
          v-model="viewMode"
          flat
          rounded
          unelevated
          toggle-color="primary"
          color="grey-7"
          :options="[
            { label: 'Grid View', value: 'grid', icon: 'grid_view' },
            { label: 'List View', value: 'list', icon: 'list' },
          ]"
        />
        <q-btn
          unelevated
          color="black"
          icon="add"
          label="Add Class"
          rounded
          to="/dashboard/classes"
          class="q-mr-sm"
        />
        <q-btn flat round color="grey-7" icon="print" @click="printTimetable">
          <q-tooltip>Print Timetable</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div v-for="day in weekDays" :key="day" class="col-12 col-md">
        <q-card flat bordered class="rounded-borders day-column full-height modern-card">
          <q-card-section :class="`bg-${getDayColor(day)} text-white q-py-sm text-center`">
            <div class="text-subtitle1 text-weight-bolder uppercase letter-spacing-1">
              {{ day }}
            </div>
          </q-card-section>

          <q-card-section class="q-pa-sm">
            <div v-if="getClassesForDay(day).length === 0" class="text-center q-pa-lg text-grey-4">
              <q-icon name="event_busy" size="32px" />
              <div class="text-caption">No Classes</div>
            </div>

            <div v-else class="q-gutter-y-sm">
              <q-card
                v-for="cls in getClassesForDay(day)"
                :key="cls.id"
                flat
                bordered
                class="class-item-card"
                :style="`border-left: 4px solid var(--q-${getDayColor(day)})`"
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-between no-wrap q-mb-xs">
                    <div class="text-caption text-weight-bold text-primary">
                      {{ cls.startTime }} - {{ cls.endTime }}
                    </div>
                    <q-badge
                      color="indigo-1"
                      text-color="indigo-9"
                      class="text-weight-bold q-px-sm q-py-xs"
                    >
                      {{ cls.grade }}
                    </q-badge>
                  </div>
                  <div class="text-subtitle2 text-weight-bolder text-grey-9 line-clamp-1">
                    {{ cls.name }}
                  </div>
                  <div class="text-caption text-grey-6 row items-center">
                    <q-icon name="person" size="xs" class="q-mr-xs" />
                    {{ cls.teacher }}
                  </div>
                  <div class="text-caption text-grey-6 row items-center">
                    <q-icon name="room" size="xs" class="q-mr-xs" />
                    {{ cls.room || 'Hall A' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="row q-col-gutter-md">
      <div class="col-12 col-lg-8 offset-lg-2">
        <q-list bordered separator class="rounded-borders bg-white shadow-1 modern-card">
          <template v-for="day in weekDays" :key="'list-' + day">
            <q-item-label
              header
              class="text-weight-bolder text-uppercase text-primary bg-grey-1 q-py-sm"
            >
              {{ day }}
            </q-item-label>

            <q-item v-if="getClassesForDay(day).length === 0" class="q-py-md">
              <q-item-section class="text-center text-grey-5 italic"
                >No classes scheduled</q-item-section
              >
            </q-item>

            <q-item v-for="cls in getClassesForDay(day)" :key="'item-' + cls.id" class="q-py-md">
              <q-item-section avatar>
                <div
                  class="time-badge bg-primary text-white text-center q-pa-xs rounded-borders shadow-1"
                >
                  <div class="text-caption text-weight-bold">{{ cls.startTime }}</div>
                  <div class="text-caption" style="font-size: 8px">TO</div>
                  <div class="text-caption text-weight-bold">{{ cls.endTime }}</div>
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6 text-weight-bold">{{ cls.name }}</q-item-label>
                <q-item-label caption class="text-weight-medium">
                  <q-icon name="person" color="grey-6" /> {{ cls.teacher }}
                  <q-icon name="room" color="grey-6" class="q-ml-sm" /> {{ cls.room || 'N/A' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  color="indigo-1"
                  text-color="indigo-9"
                  class="text-weight-bold q-px-md q-py-sm"
                >
                  {{ cls.grade }}
                </q-badge>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useClassStore } from 'src/stores/classStore'

const classStore = useClassStore()
const viewMode = ref('grid')

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const getClassesForDay = (day) => {
  return classStore.classes
    .filter((c) => c.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

const getDayColor = (day) => {
  const colors = {
    Monday: 'indigo',
    Tuesday: 'purple',
    Wednesday: 'teal',
    Thursday: 'orange',
    Friday: 'pink',
    Saturday: 'blue-10',
    Sunday: 'red-10',
  }
  return colors[day] || 'grey'
}

const printTimetable = () => {
  window.print()
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}
.day-column {
  min-height: 500px;
}
.class-item-card {
  border-radius: 8px;
  background: #fdfdfd;
  transition: all 0.2s ease;
}
.class-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.line-height-tight {
  line-height: 1.2;
}
.time-badge {
  width: 65px;
  line-height: 1;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media print {
  .no-print {
    display: none !important;
  }
  .q-page {
    padding: 0 !important;
    background: white !important;
  }
  .day-column {
    min-height: auto;
    margin-bottom: 20px;
  }
}
</style>
