import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { getNavItemsForRole } from '@/config/navigation'
import { isStaffRole } from '@/config/roles'
import type { StaffRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: StaffRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isStaffRole(user.role)) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = getNavItemsForRole(user.role)[0]?.href ?? '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}
