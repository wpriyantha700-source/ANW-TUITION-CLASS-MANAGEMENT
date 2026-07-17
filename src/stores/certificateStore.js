import { defineStore } from 'pinia'

export const useCertificateStore = defineStore('certificates', {
  state: () => ({
    issuedCertificates: JSON.parse(localStorage.getItem('anw_certificates')) || [],
    templates: [
      { id: 'standard', name: 'Standard Achievement', color: 'indigo' },
      { id: 'honor', name: 'Honor Roll', color: 'amber' },
      { id: 'completion', name: 'Course Completion', color: 'emerald' },
      { id: 'exam_result', name: 'Exam Result Report', color: 'deep-orange' },
    ],
  }),
  actions: {
    issueCertificate(data) {
      const newCert = {
        ...data,
        id: 'CERT-' + Date.now(),
        issuedDate: new Date().toISOString(),
      }
      this.issuedCertificates.unshift(newCert)
      this.saveToLocal()
      return newCert
    },
    deleteCertificate(id) {
      this.issuedCertificates = this.issuedCertificates.filter((c) => c.id !== id)
      this.saveToLocal()
    },
    saveToLocal() {
      localStorage.setItem('anw_certificates', JSON.stringify(this.issuedCertificates))
    },
  },
})
