import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const useExamStore = defineStore('exams', {
  state: () => ({
    exams: [],
    loading: false,
  }),
  actions: {
    async fetchExams() {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        return
      }

      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(
          `
          *,
          exam_results (
            *,
            students (name)
          )
        `,
        )
        .eq('institute_id', userStore.institute.id)
        .order('date', { ascending: false })

      if (examsError) {
        console.error('Error fetching exams:', examsError)
        this.loading = false
        return
      }

      this.exams = examsData.map((e) => ({
        ...e,
        classId: e.class_id,
        totalMarks: e.total_marks,
        results: e.exam_results.map((r) => ({
          ...r,
          studentId: r.student_id,
          name: r.students?.name || 'Unknown Student',
        })),
      }))
      this.loading = false
    },

    async addExam(exam) {
      this.loading = true
      const userStore = useUserStore()
      if (!userStore.institute?.id) {
        console.error('No institute ID found. User might not be logged in or institute not loaded.')
        this.loading = false
        throw new Error('Institute session not found. Please refresh or log in again.')
      }

      // Determine if classId is a UUID or a custom string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        exam.classId,
      )
      const actualClassId = isUuid ? exam.classId : null

      const insertData = {
        institute_id: userStore.institute.id,
        class_id: actualClassId,
        title: exam.title,
        date: exam.date,
        total_marks: exam.totalMarks,
        grade: exam.grade || null,
        subject: exam.subject || (isUuid ? null : exam.classId),
      }

      console.log('Inserting exam data:', insertData)

      const { data, error } = await supabase.from('exams').insert([insertData]).select()

      if (error) {
        console.error('Database INSERT error in addExam:', error)
        this.loading = false
        throw error
      }

      if (data && data[0]) {
        // If results were provided during creation (though UI usually does it separately)
        if (exam.results?.length > 0) {
          await this.updateResults(data[0].id, exam.results)
        } else {
          await this.fetchExams()
        }
      }
      this.loading = false
    },

    async updateResults(examId, results) {
      this.loading = true
      const userStore = useUserStore()

      // First delete existing results for this exam
      const { error: deleteError } = await supabase
        .from('exam_results')
        .delete()
        .eq('exam_id', examId)

      if (deleteError) {
        console.error('Error clearing old results:', deleteError)
        this.loading = false
        throw deleteError
      }

      // Insert new results
      if (results.length > 0) {
        const resultsToInsert = results.map((r) => ({
          institute_id: userStore.institute.id,
          exam_id: examId,
          student_id: r.studentId,
          marks: r.marks,
          grade: r.grade,
          remarks: r.remarks,
        }))

        const { error: insertError } = await supabase.from('exam_results').insert(resultsToInsert)

        if (insertError) {
          console.error('Error saving results:', insertError)
          this.loading = false
          throw insertError
        }
      }

      await this.fetchExams()
      this.loading = false
    },

    async deleteExam(examId) {
      this.loading = true
      const { error } = await supabase.from('exams').delete().eq('id', examId)

      if (error) {
        console.error('Error deleting exam:', error)
        this.loading = false
        throw error
      }

      this.exams = this.exams.filter((e) => e.id !== examId)
      this.loading = false
    },
  },
})
