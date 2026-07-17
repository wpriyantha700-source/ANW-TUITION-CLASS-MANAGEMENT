import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [],
    loading: false,
  }),
  actions: {
    async fetchStudents() {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        console.warn('Institute ID not found in userStore. Skipping fetch.')
        this.loading = false
        return
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('institute_id', userStore.institute.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching students:', error)
        this.loading = false
        return
      }

      // Map database fields to app fields to maintain UI compatibility
      this.students = data.map((s) => ({
        ...s,
        classes: s.subjects || [],
        phone: s.contact_number || '',
        parent: s.parent_name || '',
        parentPhone: s.parent_contact || '',
        regDate: s.reg_date ? new Date(s.reg_date).toLocaleDateString() : 'N/A',
      }))
      this.loading = false
    },

    async addStudent(student) {
      const userStore = useUserStore()

      // Calculate sequence number (we can do this locally for now or better via a function in DB)
      const sequenceNumbers = this.students
        .map((s) => {
          const num = parseInt(s.id_number?.split('-')[1])
          return isNaN(num) ? 0 : num
        })
        .filter((n) => n > 0)

      const nextNum = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1
      const paddedNum = nextNum.toString().padStart(4, '0')
      const idNumber = 'ST-' + paddedNum

      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: student.name,
            email: student.email,
            dob: student.dob,
            gender: student.gender,
            grade: student.grade,
            school: student.school,
            subjects: student.classes || [],
            institute_id: userStore.institute.id,
            id_number: idNumber,
            contact_number: student.contact_number,
            parent_name: student.parent_name,
            parent_contact: student.parent_contact,
            parent_occupation: student.parent_occupation,
            emergency_contact: student.emergency_contact,
            address: student.address,
            reg_date: new Date().toISOString().split('T')[0],
          },
        ])
        .select()

      if (error) {
        console.error('Error adding student:', error)
        throw error
      }

      if (data) {
        const newStudent = data[0]
        this.students.unshift({
          ...newStudent,
          classes: newStudent.subjects || [],
          phone: newStudent.contact_number || '',
          parent: newStudent.parent_name || '',
          parentPhone: newStudent.parent_contact || '',
          regDate: newStudent.reg_date ? new Date(newStudent.reg_date).toLocaleDateString() : 'N/A',
        })
      }
    },

    async updateStudent(id, updatedData) {
      const { error } = await supabase
        .from('students')
        .update({
          name: updatedData.name,
          email: updatedData.email,
          dob: updatedData.dob,
          gender: updatedData.gender,
          grade: updatedData.grade,
          school: updatedData.school,
          subjects: updatedData.classes || updatedData.subjects,
          contact_number: updatedData.contact_number,
          parent_name: updatedData.parent_name,
          parent_contact: updatedData.parent_contact,
          parent_occupation: updatedData.parent_occupation,
          emergency_contact: updatedData.emergency_contact,
          address: updatedData.address,
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating student:', error)
        throw error
      }

      const index = this.students.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.students[index] = { ...this.students[index], ...updatedData }
      }
    },

    async removeStudent(id) {
      const { error } = await supabase.from('students').delete().eq('id', id)

      if (error) {
        console.error('Error deleting student:', error)
        throw error
      }

      this.students = this.students.filter((s) => s.id !== id)
    },
  },
  getters: {
    totalStudents: (state) => state.students.length,
    studentsByGrade: (state) => (grade) => state.students.filter((s) => s.grade === grade).length,
  },
})
