import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginCredentials, User } from '@/types/auth'
import { login as apiLogin, logout as apiLogout } from '@/lib/api/auth'
import { isStaffRole } from '@/config/roles'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  schoolId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      schoolId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const data = await apiLogin(credentials)

          if (!isStaffRole(data.user.role)) {
            throw new Error('This portal is for staff only. Parent and student accounts cannot sign in here.')
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            schoolId: credentials.schoolId,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      logout: async () => {
        await apiLogout(get().accessToken)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          schoolId: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'schoolmate-staff-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        schoolId: state.schoolId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
