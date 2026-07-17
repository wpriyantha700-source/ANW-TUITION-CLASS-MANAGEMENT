import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [],
    loading: false,
  }),
  actions: {
    async fetchAttendance(classId = null, date = null) {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        return
      }

      let query = supabase.from('attendance').select('*').eq('institute_id', userStore.institute.id)

      if (classId) query = query.eq('class_id', classId)
      if (date) query = query.eq('date', date)

      const { data, error } = await query.order('date', { ascending: false })

      if (error) {
        console.error('Error fetching attendance:', error)
        this.loading = false
        return
      }

      this.records = data.map((r) => ({
        ...r,
        classId: r.class_id,
        attendanceList: r.students_data,
      }))
      this.loading = false
    },

    async markAttendance(
      classId,
      date,
      attendanceList,
      grade = null,
      subject = null,
      teacher = null,
    ) {
      const userStore = useUserStore()

      // Determine if classId is a UUID or a custom string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)
      const actualClassId = isUuid ? classId : null

      // Check if a record already exists for this context in DB
      let query = supabase
        .from('attendance')
        .select('id')
        .eq('institute_id', userStore.institute.id)
        .eq('date', date)

      if (actualClassId) {
        query = query.eq('class_id', actualClassId)
      } else {
        query = query.eq('grade', grade || '').eq('subject', subject || '')
        if (teacher) {
          query = query.eq('teacher', teacher)
        }
      }

      const { data: existingRecords } = await query

      const sessionData = {
        institute_id: userStore.institute.id,
        class_id: actualClassId,
        date: date,
        students_data: attendanceList,
        grade: grade,
        subject: subject,
        teacher: teacher,
      }

      let error
      if (existingRecords && existingRecords.length > 0) {
        // Update existing
        const { error: updateError } = await supabase
          .from('attendance')
          .update(sessionData)
          .eq('id', existingRecords[0].id)
        error = updateError
      } else {
        // Create new
        const { error: insertError } = await supabase.from('attendance').insert([sessionData])
        error = insertError
      }

      if (error) {
        console.error('Error saving attendance:', error)
        throw error
      }

      // Refresh local records
      await this.fetchAttendance(actualClassId)
    },
  },
  getters: {
    getAttendanceByDate: (state) => (date) => state.records.filter((r) => r.date === date),
    getRecord:
      (state) =>
      (classId, date, teacher = null) =>
        state.records.find((r) => {
          const baseMatch = r.classId === classId && r.date === date
          if (teacher && r.teacher) {
            return baseMatch && r.teacher === teacher
          }
          return baseMatch
        }),
    getStudentAttendance: (state) => (studentId) => {
      const history = []
      state.records.forEach((record) => {
        const studentMark = record.students_data?.find((d) => d.studentId === studentId)
        if (studentMark) {
          history.push({
            date: record.date,
            classId: record.classId,
            status: studentMark.status === 'present',
            id: record.id,
          })
        }
      })
      return history.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    getRecordsByMonth: (state) => (classId, monthYear) => {
      // monthYear format: "2023-10"
      return state.records.filter((r) => r.classId === classId && r.date.startsWith(monthYear))
    },
    overallAttendanceRate: (state) => {
      if (state.records.length === 0) return 0
      let totalStudents = 0
      let presentStudents = 0
      state.records.forEach((record) => {
        if (record.students_data && Array.isArray(record.students_data)) {
          totalStudents += record.students_data.length
          presentStudents += record.students_data.filter((s) => s.status === 'present').length
        }
      })
      if (totalStudents === 0) return 0
      return Math.round((presentStudents / totalStudents) * 100)
    },
  },
})
