import { defineStore } from 'pinia'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [
      {
        id: 1,
        name: 'Admin',
        userCount: 1,
        color: 'indigo',
        description: 'Full access to all modules and system settings.',
        permissions: [
          'manage_users',
          'manage_roles',
          'financial_access',
          'view_reports',
          'manage_classes',
          'view_students',
          'register_students',
          'mark_attendance',
          'collect_fees',
          'manage_communication',
          'manage_results',
          'manage_certificates'
        ]
      },
      {
        id: 2,
        name: 'Teacher',
        userCount: 5,
        color: 'green',
        description: 'Access to assigned classes, attendance, and student list.',
        permissions: ['view_students', 'mark_attendance', 'manage_classes', 'manage_results', 'view_schedules']
      },
      {
        id: 3,
        name: 'Staff',
        userCount: 2,
        color: 'orange',
        description: 'Helper role for student registration and simple tasks.',
        permissions: ['register_students', 'view_attendance', 'collect_fees', 'view_students']
      },
      {
        id: 4,
        name: 'Student',
        userCount: 15,
        color: 'blue-7',
        description: 'Access to their own schedules, results, and study materials.',
        permissions: ['view_schedules', 'view_results', 'access_materials']
      }
    ],
    availablePermissions: [
      { label: 'Manage Users', value: 'manage_users' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Financial Access', value: 'financial_access' },
      { label: 'View Reports', value: 'view_reports' },
      { label: 'Manage Classes', value: 'manage_classes' },
      { label: 'View Students', value: 'view_students' },
      { label: 'Register Students', value: 'register_students' },
      { label: 'Mark Attendance', value: 'mark_attendance' },
      { label: 'View Attendance', value: 'view_attendance' },
      { label: 'Collect Fees', value: 'collect_fees' },
      { label: 'Manage Communication', value: 'manage_communication' },
      { label: 'Manage Results', value: 'manage_results' },
      { label: 'View Results', value: 'view_results' },
      { label: 'Manage Certificates', value: 'manage_certificates' },
      { label: 'View Schedules', value: 'view_schedules' },
      { label: 'Access Materials', value: 'access_materials' }
    ]
  }),

  actions: {
    addRole(role) {
      // Simulate ID generation
      const newId = Math.max(...this.roles.map(r => r.id)) + 1
      this.roles.push({
        id: newId,
        userCount: 0,
        color: 'blue-grey', // Default color
        ...role
      })
    },

    updateRole(id, updatedRole) {
      const index = this.roles.findIndex(r => r.id === id)
      if (index !== -1) {
        this.roles[index] = { ...this.roles[index], ...updatedRole }
      }
    },

    deleteRole(id) {
      const index = this.roles.findIndex(r => r.id === id)
      if (index !== -1) {
        // Prevent deleting Admin
        if (this.roles[index].name === 'Admin') return false
        this.roles.splice(index, 1)
        return true
      }
      return false
    }
  }
})
