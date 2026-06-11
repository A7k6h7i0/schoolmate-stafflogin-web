import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { StudentsPage } from '@/pages/modules/StudentsPage'
import { AttendancePage } from '@/pages/modules/AttendancePage'
import { AcademicsPage } from '@/pages/modules/AcademicsPage'
import { SportsPage } from '@/pages/modules/SportsPage'
import { CommunicationPage } from '@/pages/modules/CommunicationPage'
import { FinancePage } from '@/pages/modules/FinancePage'
import { HrPage } from '@/pages/modules/HrPage'
import { TransportPage } from '@/pages/modules/TransportPage'
import { LibraryPage } from '@/pages/modules/LibraryPage'
import { AnalyticsPage } from '@/pages/modules/AnalyticsPage'
import { DataOpsPage } from '@/pages/modules/DataOpsPage'
import { SettingsPage } from '@/pages/modules/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER', 'ACCOUNTANT']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="academics"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER']}>
              <AcademicsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="sports"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER']}>
              <SportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="communication"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER']}>
              <CommunicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACCOUNTANT']}>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <HrPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="transport"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'DRIVER']}>
              <TransportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="library"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'LIBRARIAN']}>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'ACCOUNTANT']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="data-ops"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'ACCOUNTANT']}>
              <DataOpsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute
              allowedRoles={[
                'SCHOOL_ADMIN',
                'ACADEMIC_ADMIN',
                'TEACHER',
                'ACCOUNTANT',
                'LIBRARIAN',
                'DRIVER',
              ]}
            >
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
