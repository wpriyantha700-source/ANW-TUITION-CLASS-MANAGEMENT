<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-ma-none text-grey-9">
          {{ isEdit ? 'Update Student Record' : 'Student Registration' }}
        </h1>
        <p class="text-subtitle2 text-grey-6 q-mt-xs">
          {{
            isEdit
              ? 'Modify existing student information in the system'
              : 'Register a new student to the system'
          }}
        </p>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          label="Back to List"
          to="/dashboard/students"
          class="q-mr-sm"
        />
      </div>
    </div>

    <!-- Registration Form -->
    <div class="row q-col-gutter-lg justify-center">
      <div class="col-12 col-lg-10">
        <q-form ref="formRef" @submit="handleRegister" class="q-gutter-y-md">
          <!-- Section 1: Personal Information -->
          <q-card flat bordered class="rounded-borders modern-card">
            <q-card-section class="bg-white q-pb-none">
              <div class="row items-center q-mb-md">
                <q-avatar
                  color="indigo-1"
                  text-color="indigo"
                  icon="person"
                  size="md"
                  class="q-mr-md"
                />
                <div class="text-h6 text-weight-bold">Personal Information</div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-xs">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="form.fullName"
                    label="Full Name"
                    outlined
                    dense
                    lazy-rules
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.dob"
                    label="Date of Birth"
                    outlined
                    dense
                    type="date"
                    stack-label
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.gender"
                    :options="['Male', 'Female', 'Other']"
                    label="Gender"
                    outlined
                    dense
                    lazy-rules
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.phone"
                    label="Student Phone (Optional)"
                    outlined
                    dense
                    mask="### #######"
                    unmasked-value
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.email"
                    label="Email Address (Optional)"
                    outlined
                    dense
                    type="email"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.address"
                    label="Home Address"
                    outlined
                    dense
                    autogrow
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Section 2: Parent/Guardian Details -->
          <q-card flat bordered class="rounded-borders modern-card">
            <q-card-section class="bg-white q-pb-none">
              <div class="row items-center q-mb-md">
                <q-avatar
                  color="green-1"
                  text-color="green"
                  icon="family_restroom"
                  size="md"
                  class="q-mr-md"
                />
                <div class="text-h6 text-weight-bold">Parent / Guardian Details</div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-xs">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.parentName"
                    label="Parent/Guardian Name"
                    outlined
                    dense
                    lazy-rules
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.parentPhone"
                    label="Parent/Guardian Phone"
                    outlined
                    dense
                    mask="### #######"
                    unmasked-value
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.parentOccupation" label="Occupation" outlined dense />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.emergencyContact"
                    label="Emergency Contact Number"
                    outlined
                    dense
                    mask="### #######"
                    unmasked-value
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Section 3: Academic Details -->
          <q-card flat bordered class="rounded-borders modern-card">
            <q-card-section class="bg-white q-pb-none">
              <div class="row items-center q-mb-md">
                <q-avatar
                  color="orange-1"
                  text-color="orange"
                  icon="school"
                  size="md"
                  class="q-mr-md"
                />
                <div class="text-h6 text-weight-bold">Academic Details</div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-xs">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.grade"
                    :options="gradeOptions"
                    label="Current Grade/Level"
                    outlined
                    dense
                    lazy-rules
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="form.school"
                    label="School Name"
                    outlined
                    dense
                    lazy-rules
                    :rules="[(val) => !!val || 'Required']"
                  />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="form.classes"
                    label="Enroll Specific Subjects"
                    multiple
                    outlined
                    dense
                    use-input
                    use-chips
                    placeholder="Select or type subjects"
                    hint="Select from system classes or type custom ones and press Enter"
                    new-value-mode="add-unique"
                    :options="availableClassOptions"
                    @input-value="onSubjectInput"
                    stack-label
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          Type any subject name and press Enter
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Submit Buttons -->
          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              v-if="!isEdit"
              label="Reset Form"
              flat
              color="grey-7"
              type="reset"
              class="q-px-md"
            />
            <q-btn
              :label="isEdit ? 'Update Student' : 'Complete Registration'"
              color="black"
              unelevated
              rounded
              class="q-px-xl text-weight-bold shadow-2"
              @click="submitForm"
              :loading="loading"
            />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStudentStore } from 'src/stores/studentStore'
import { useClassStore } from 'src/stores/classStore'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const studentStore = useStudentStore()
const classStore = useClassStore()
const loading = ref(false)
const formRef = ref(null)
const subjectInput = ref('')

const availableClassOptions = computed(() => {
  return classStore.classes.map((c) => c.name)
})

const studentId = computed(() => route.params.id)
const isEdit = computed(() => !!studentId.value)

onMounted(async () => {
  if (studentStore.students.length === 0) {
    await studentStore.fetchStudents()
  }

  if (isEdit.value) {
    const student = studentStore.students.find((s) => s.id === studentId.value)
    if (student) {
      form.fullName = student.name
      form.email = student.email || ''
      form.phone = student.phone || student.contact_number || ''
      form.dob = student.dob || ''
      form.gender = student.gender || ''
      form.address = student.address || ''
      form.parentName = student.parent || student.parent_name || ''
      form.parentPhone = student.parentPhone || student.parent_contact || ''
      form.parentOccupation = student.parentOccupation || ''
      form.emergencyContact = student.emergencyContact || ''
      form.grade = student.grade || ''
      form.school = student.school || ''
      form.classes = [...(student.classes || student.subjects || [])]
    } else {
      $q.notify({ color: 'negative', message: 'Student not found!' })
      router.push('/dashboard/students')
    }
  }
})

const gradeOptions = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'A/L Year 1',
  'A/L Year 2',
  'Other',
]

const form = reactive({
  fullName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  parentName: '',
  parentPhone: '',
  parentOccupation: '',
  emergencyContact: '',
  grade: '',
  school: '',
  classes: [],
})

const onSubjectInput = (val) => {
  subjectInput.value = val
}

const submitForm = async () => {
  const success = await formRef.value.validate()
  if (success) {
    handleRegister()
  } else {
    $q.notify({
      color: 'negative',
      message: 'Please fill all required fields (Grade, School, etc.)',
      icon: 'warning',
      position: 'top',
    })
  }
}

const handleRegister = async () => {
  loading.value = true

  try {
    // Ensure form.classes is always an array
    if (!Array.isArray(form.classes)) {
      form.classes = []
    }

    // If there's something typed but not "entered", add it now
    if (subjectInput.value && !form.classes.includes(subjectInput.value)) {
      form.classes.push(subjectInput.value)
      subjectInput.value = ''
    }

    const studentData = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      contact_number: form.phone,
      dob: form.dob,
      gender: form.gender,
      address: form.address,
      grade: form.grade,
      school: form.school,
      parent: form.parentName,
      parent_name: form.parentName,
      parentPhone: form.parentPhone,
      parent_contact: form.parentPhone,
      parentOccupation: form.parentOccupation,
      emergencyContact: form.emergencyContact,
      classes: Array.isArray(form.classes) ? [...form.classes] : [],
    }

    if (isEdit.value) {
      await studentStore.updateStudent(studentId.value, studentData)
    } else {
      await studentStore.addStudent(studentData)
    }

    $q.dialog({
      title: `<div class="text-positive text-weight-bold row items-center"><q-icon name="check_circle" class="q-mr-sm" size="sm" />${isEdit.value ? 'Update Successful!' : 'Registration Successful!'}</div>`,
      message: `The student <b>${form.fullName}</b> has been successfully ${isEdit.value ? 'updated' : 'registered'}.`,
      html: true,
      ok: { label: 'Go to List', color: 'black', unelevated: true, rounded: true },
      cancel: isEdit.value ? false : { label: 'Register Another', flat: true, color: 'grey-7' },
      persistent: true,
    })
      .onOk(() => {
        router.push('/dashboard/students')
      })
      .onCancel(() => {
        resetForm()
      })
  } catch (err) {
    $q.notify({
      color: 'negative',
      message: 'Failed to save student: ' + err.message,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  // 1. Clear Data
  Object.keys(form).forEach((key) => {
    if (Array.isArray(form[key])) {
      form[key] = []
    } else {
      form[key] = ''
    }
  })

  // 2. Clear Validation (Wait for DOM to update first)
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-card {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.modern-card:hover {
  box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.08);
}
</style>
