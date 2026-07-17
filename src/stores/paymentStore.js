import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [],
    loading: false,
  }),
  actions: {
    async fetchPayments() {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        return
      }

      const { data, error } = await supabase
        .from('payments')
        .select(
          `
          *,
          students (name),
          classes (name)
        `,
        )
        .eq('institute_id', userStore.institute.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        this.loading = false
        return
      }

      this.payments = data.map((p) => ({
        ...p,
        studentId: p.student_id,
        receiptNo: p.receipt_no,
        studentName: p.students?.name || 'Unknown Student',
        className: p.class_name || p.classes?.name || 'Other/General',
        classId: p.class_id,
      }))
      this.loading = false
    },

    async addPayment(paymentData) {
      this.loading = true
      const userStore = useUserStore()

      const receiptNo = `REC-${Math.floor(1000 + Math.random() * 9000)}`

      // Determine if classId is a UUID or a custom string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        paymentData.classId,
      )
      const actualClassId = isUuid ? paymentData.classId : null
      const customClassName = isUuid ? null : paymentData.className

      const { data, error } = await supabase.from('payments').insert([
        {
          institute_id: userStore.institute.id,
          student_id: paymentData.studentId,
          receipt_no: receiptNo,
          amount: paymentData.amount,
          month: paymentData.month,
          year: paymentData.year,
          date: new Date().toISOString().split('T')[0],
          class_id: actualClassId,
          class_name: customClassName,
        },
      ]).select(`
          *,
          students (name),
          classes (name)
        `)

      if (error) {
        console.error('Error adding payment:', error)
        this.loading = false
        throw error
      }

      if (data && data[0]) {
        const newP = {
          ...data[0],
          studentId: data[0].student_id,
          receiptNo: data[0].receipt_no,
          studentName: data[0].students?.name || paymentData.studentName,
          className: data[0].class_name || data[0].classes?.name || paymentData.className,
        }
        this.payments.unshift(newP)
        this.loading = false
        return newP
      }
      this.loading = false
      return null
    },

    async deletePayment(id) {
      const { error } = await supabase.from('payments').delete().eq('id', id)

      if (error) {
        console.error('Error deleting payment:', error)
        throw error
      }

      this.payments = this.payments.filter((p) => p.id !== id)
    },
  },
  getters: {
    totalRevenue: (state) => state.payments.reduce((acc, p) => acc + Number(p.amount), 0),
    currentMonthIncome: (state) => {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      return state.payments
        .filter((p) => {
          if (p.date) {
            const [y, m] = p.date.split('-')
            return Number(y) === currentYear && Number(m) === currentMonth
          }
          return false
        })
        .reduce((acc, p) => acc + Number(p.amount), 0)
    },
    getPaymentsByStudent: (state) => (studentId) =>
      state.payments.filter((p) => p.studentId === studentId),
    recentPayments: (state) => state.payments.slice(0, 10),
  },
})
