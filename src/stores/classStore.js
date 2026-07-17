import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const useClassStore = defineStore('classes', {
  state: () => ({
    classes: [],
    loading: false,
  }),
  actions: {
    async fetchClasses() {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        return
      }

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('institute_id', userStore.institute.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching classes:', error)
        this.loading = false
        return
      }

      // Map DB fields to UI fields and compute schedule
      this.classes = data.map((c) => ({
        ...c,
        classCode: c.class_code,
        startTime: c.start_time,
        endTime: c.end_time,
        active: c.is_active,
        schedule: c.day ? `${c.day} ${c.start_time || ''} - ${c.end_time || ''}` : 'N/A',
      }))
      this.loading = false
    },

    async addClass(classData) {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        throw new Error('Institute session not found. Please refresh.')
      }

      // Calculate class code sequence
      const { data: existingClasses } = await supabase
        .from('classes')
        .select('class_code')
        .eq('institute_id', userStore.institute.id)

      const count = (existingClasses?.length || 0) + 1
      const classCode = 'CLS-' + count.toString().padStart(3, '0')

      const insertData = {
        institute_id: userStore.institute.id,
        class_code: classCode,
        name: classData.name,
        subject: classData.subject,
        grade: classData.grade,
        teacher: classData.teacher,
        day: classData.day,
        start_time: classData.startTime,
        end_time: classData.endTime,
        fee: classData.fee,
        room: classData.room,
        is_active: true,
      }

      const { data, error } = await supabase.from('classes').insert([insertData]).select()

      if (error) {
        console.error('Error adding class:', error)
        this.loading = false
        throw error
      }

      if (data && data[0]) {
        const newClass = data[0]
        const mappedClass = {
          ...newClass,
          classCode: newClass.class_code,
          startTime: newClass.start_time,
          endTime: newClass.end_time,
          active: newClass.is_active,
          schedule: newClass.day
            ? `${newClass.day} ${newClass.start_time || ''} - ${newClass.end_time || ''}`
            : 'N/A',
        }
        this.classes.unshift(mappedClass)
      }
      this.loading = false
    },

    async updateClass(id, updatedData) {
      this.loading = true
      const { error } = await supabase
        .from('classes')
        .update({
          name: updatedData.name,
          subject: updatedData.subject,
          grade: updatedData.grade,
          teacher: updatedData.teacher,
          day: updatedData.day,
          start_time: updatedData.startTime,
          end_time: updatedData.endTime,
          fee: updatedData.fee,
          room: updatedData.room,
          is_active: updatedData.active,
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating class:', error)
        this.loading = false
        throw error
      }

      const index = this.classes.findIndex((c) => c.id === id)
      if (index !== -1) {
        // Refresh the class in local state
        const updated = {
          ...this.classes[index],
          ...updatedData,
          schedule: updatedData.day
            ? `${updatedData.day} ${updatedData.startTime || ''} - ${updatedData.endTime || ''}`
            : 'N/A',
        }
        this.classes[index] = updated
      }
      this.loading = false
    },

    async deleteClass(id) {
      const { error } = await supabase.from('classes').delete().eq('id', id)

      if (error) {
        console.error('Error deleting class:', error)
        throw error
      }

      this.classes = this.classes.filter((c) => c.id !== id)
    },
  },
  getters: {
    totalClasses: (state) => state.classes.length,
    activeClasses: (state) => state.classes.filter((c) => c.active).length,
  },
})
