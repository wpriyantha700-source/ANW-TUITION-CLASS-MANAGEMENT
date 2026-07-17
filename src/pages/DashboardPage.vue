<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header Section -->
    <div class="q-mb-lg flex justify-between items-center">
      <div>
        <div class="text-h4 text-weight-bold text-slate-900 tracking-tight">Good Morning!</div>
        <div class="text-subtitle1 text-slate-500 q-mt-xs">
          Welcome to
          <span class="text-indigo-7 text-weight-bold">{{ instituteName }}</span> Dashboard.
        </div>
      </div>
      <q-btn
        unelevated
        color="black"
        text-color="white"
        icon="add"
        label="New Student"
        rounded
        to="/dashboard/students/register"
      />
    </div>

    <!-- Stats Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="flex justify-between items-start">
            <div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
                Total Students
              </div>
              <div class="text-h4 text-weight-bolder text-black">
                {{ studentStore.totalStudents }}
              </div>
              <div class="text-caption text-grey-6 text-weight-medium">
                {{ studentStore.totalStudents > 0 ? 'Students Registered' : 'No students yet' }}
              </div>
            </div>
            <q-avatar color="indigo-1" text-color="indigo" icon="school" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="flex justify-between items-start">
            <div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
                Active Classes
              </div>
              <div class="text-h4 text-weight-bolder text-black">
                {{ classStore.activeClasses }}
              </div>
              <div class="text-caption text-grey-6 text-weight-medium">
                {{ classStore.activeClasses > 0 ? 'Active Classes' : 'No active classes' }}
              </div>
            </div>
            <q-avatar color="orange-1" text-color="orange" icon="class" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="flex justify-between items-start">
            <div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
                Monthly Income
              </div>
              <div class="text-h4 text-weight-bolder text-black">
                Rs. {{ paymentStore.currentMonthIncome.toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 text-weight-medium">
                {{ paymentStore.currentMonthIncome > 0 ? 'Monthly Revenue' : 'No income recorded' }}
              </div>
            </div>
            <q-avatar color="green-1" text-color="green" icon="payments" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="flex justify-between items-start">
            <div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">
                Attendance Rate
              </div>
              <div class="text-h4 text-weight-bolder text-black">
                {{ attendanceStore.overallAttendanceRate }}%
              </div>
              <div class="text-caption text-grey-6 text-weight-medium">
                {{ attendanceStore.records.length > 0 ? 'Overall Average' : 'No attendance data' }}
              </div>
            </div>
            <q-avatar color="pink-1" text-color="pink" icon="fact_check" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="row q-col-gutter-md">
      <!-- Left Column: Recent Activity/Table -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders full-height">
          <q-card-section class="row items-center justify-between q-pb-none">
            <div class="text-h6 text-weight-bold">Recent Payments</div>
            <q-btn flat dense color="primary" label="View All" no-caps to="/dashboard/fees" />
          </q-card-section>
          <q-card-section>
            <q-table
              flat
              :rows="paymentStore.recentPayments"
              :columns="paymentColumns"
              row-key="id"
              hide-pagination
              :rows-per-page-options="[5]"
            >
              <template v-slot:body-cell-amount="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-green-7">
                    Rs. {{ props.value.toLocaleString() }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column: Schedule/Quick Actions -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders q-mb-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">Today's Schedule</div>
            <q-list separator v-if="todaysClasses.length > 0">
              <q-item v-for="cls in todaysClasses" :key="cls.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar color="indigo-1" text-color="indigo" font-size="14px">
                    {{ cls.schedule.split(' ')[1] }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ cls.name }}</q-item-label>
                  <q-item-label caption>{{ cls.teacher }} • {{ cls.room }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="grey-3" text-color="grey-9" label="Today" />
                </q-item-section>
              </q-item>
            </q-list>
            <q-list v-else>
              <div class="text-grey-6 text-caption text-center q-pa-md">
                No classes scheduled for today
              </div>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="bg-black text-white rounded-borders">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Quick Actions</div>
            <div class="q-gutter-sm q-mt-sm">
              <q-btn
                outline
                color="white"
                label="Add Student"
                class="full-width"
                no-caps
                to="/dashboard/students/register"
              />
              <q-btn
                outline
                color="white"
                label="Manage Classes"
                class="full-width"
                no-caps
                to="/dashboard/classes"
              />
              <q-btn
                outline
                color="white"
                label="Mark Attendance"
                class="full-width"
                no-caps
                to="/dashboard/attendance"
              />
              <q-btn
                outline
                color="white"
                label="Subject Materials"
                class="full-width"
                no-caps
                to="/dashboard/materials"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'
import { usePaymentStore } from 'src/stores/paymentStore'
import { useAttendanceStore } from 'src/stores/attendanceStore'
import { useUserStore } from 'src/stores/userStore'

const studentStore = useStudentStore()
const classStore = useClassStore()
const paymentStore = usePaymentStore()
const attendanceStore = useAttendanceStore()
const userStore = useUserStore()

const instituteName = computed(() => userStore.institute?.name || 'ANW Tuition')

const todaysClasses = computed(() => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[new Date().getDay()]

  return classStore.classes.filter((c) => {
    // Basic string matching for daily schedule (e.g. "Saturday 08:00 AM")
    return c.active && c.schedule.toLowerCase().includes(today.toLowerCase())
  })
})

const paymentColumns = [
  { name: 'receiptNo', align: 'left', label: 'RECEIPT', field: 'receiptNo', sortable: true },
  { name: 'studentName', align: 'left', label: 'STUDENT', field: 'studentName', sortable: true },
  { name: 'amount', label: 'AMOUNT', field: 'amount', sortable: true, align: 'right' },
]
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
