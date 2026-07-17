import { defineStore } from 'pinia'

export const useCommunicationStore = defineStore('communication', {
  state: () => ({
    history: JSON.parse(localStorage.getItem('anw_comm_history')) || [],
  }),
  actions: {
    logMessage(messageData) {
      const newMessage = {
        ...messageData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        recipients: messageData.recipients || [], // List of student names
      }
      this.history.unshift(newMessage)
      this.saveToLocal()
    },
    saveToLocal() {
      localStorage.setItem('anw_comm_history', JSON.stringify(this.history))
    },
    clearHistory() {
      this.history = []
      this.saveToLocal()
    },
  },
})
