export default async () => {
  console.log('Running data migrations...')

  // 1. Fix Students
  const studentsRaw = localStorage.getItem('anw_students')
  if (studentsRaw) {
    try {
      const students = JSON.parse(studentsRaw)
      let changed = false
      students.forEach((s) => {
        if (s.classes && Array.isArray(s.classes)) {
          s.classes = s.classes.map((cls) => {
            if (cls === 'Sceince') {
              changed = true
              return 'Science'
            }
            return cls
          })
        }
      })
      if (changed) {
        localStorage.setItem('anw_students', JSON.stringify(students))
        console.log('Fixed "Sceince" in students data')
      }
    } catch (e) {
      console.error('Migration error (students):', e)
    }
  }

  // 2. Fix Classes
  const classesRaw = localStorage.getItem('anw_classes')
  if (classesRaw) {
    try {
      const classes = JSON.parse(classesRaw)
      let changed = false
      classes.forEach((c) => {
        if (c.subject === 'Sceince') {
          c.subject = 'Science'
          changed = true
        }
        if (c.name && c.name.includes('Sceince')) {
          c.name = c.name.replace('Sceince', 'Science')
          changed = true
        }
      })
      if (changed) {
        localStorage.setItem('anw_classes', JSON.stringify(classes))
        console.log('Fixed "Sceince" in classes data')
      }
    } catch (e) {
      console.error('Migration error (classes):', e)
    }
  }

  // 3. Fix Attendance Records
  const attendanceRaw = localStorage.getItem('anw_attendance')
  if (attendanceRaw) {
    try {
      const records = JSON.parse(attendanceRaw)
      let changed = false
      records.forEach((r) => {
        if (r.classId && r.classId.includes('Sceince')) {
          r.classId = r.classId.replace('Sceince', 'Science')
          changed = true
        }
      })
      if (changed) {
        localStorage.setItem('anw_attendance', JSON.stringify(records))
        console.log('Fixed "Sceince" in attendance records')
      }
    } catch (e) {
      console.error('Migration error (attendance):', e)
    }
  }
}
