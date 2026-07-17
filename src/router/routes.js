const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/update-password',
    component: () => import('pages/UpdatePasswordPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'students', component: () => import('pages/StudentList.vue') },
      { path: 'students/register', component: () => import('pages/StudentRegistration.vue') },
      { path: 'students/edit/:id', component: () => import('pages/StudentRegistration.vue') },
      { path: 'classes', component: () => import('pages/ClassManagement.vue') },
      { path: 'schedule', component: () => import('pages/SchedulePage.vue') },
      { path: 'attendance', component: () => import('pages/AttendanceManagement.vue') },
      { path: 'attendance/reports', component: () => import('pages/AttendanceReports.vue') },
      { path: 'fees', component: () => import('pages/FeeManagement.vue') },
      { path: 'communication', component: () => import('pages/CommunicationPage.vue') },
      { path: 'results', component: () => import('pages/ResultsManagement.vue') },
      { path: 'certificates', component: () => import('pages/CertificateManagement.vue') },
      { path: 'materials', component: () => import('pages/SubjectMaterials.vue') },
      { path: 'users', component: () => import('pages/UsersManagement.vue') },
      { path: 'roles', component: () => import('pages/RolesManagement.vue') },
      { path: 'audit-logs', component: () => import('pages/AuditLogs.vue') },
      { path: 'ai-assistant', component: () => import('pages/AiAssistantPage.vue') },
      { path: 'master/licenses', component: () => import('pages/AdminLicensePage.vue') },
    ],
  },
  {
    path: '/i/:slug',
    component: () => import('pages/PublicInstitutePage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
