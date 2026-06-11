import { useAuthStore } from '@/stores/auth-store'
import { isSchoolAdmin } from '@/config/roles'

export function useIsSchoolAdmin(): boolean {
  const role = useAuthStore((state) => state.user?.role)
  return isSchoolAdmin(role)
}
