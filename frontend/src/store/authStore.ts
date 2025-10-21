import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { authService } from '@/services/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    username: string
    password: string
    full_name: string
    phone?: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  checkPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  canCreateMore: (recordType: string, currentCount: number) => boolean
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  refreshUserInfo: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        console.log('🔐 authStore.login 开始')
        set({ loading: true })
        try {
          const success = await authService.loginWithAccount({
            account: email,
            password: password
          })
          console.log('📊 authService.loginWithAccount 返回:', success)

          if (success) {
            const user = authService.getCurrentUserFromStorage()
            console.log('👤 获取到用户信息:', user)

            // 立即更新状态
            set({ user, isAuthenticated: true, loading: false })
            console.log('✅ authStore 状态已更新: isAuthenticated=true')

            return true
          }

          console.log('❌ 登录失败')
          set({ loading: false })
          return false
        } catch (error) {
          console.error('❌ Login error:', error)
          set({ loading: false })
          return false
        }
      },

      register: async (data) => {
        set({ loading: true })
        try {
          const success = await authService.register(data)
          // 注册成功后不自动登录，用户需要手动登录
          return success
        } catch (error) {
          console.error('Register error:', error)
          return false
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          await authService.logout()
          set({ user: null, isAuthenticated: false })
        } catch (error) {
          console.error('Logout error:', error)
          // 即使API调用失败，也要清除本地状态
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ loading: false })
        }
      },

      refreshToken: async () => {
        try {
          const success = await authService.refreshToken()
          if (!success) {
            set({ user: null, isAuthenticated: false })
            return false
          }

          // 刷新token成功后，重新获取用户信息以更新权限和会员等级
          const updatedUser = await authService.getCurrentUser()
          if (updatedUser) {
            set({ user: updatedUser })
          }

          return success
        } catch (error) {
          console.error('Token refresh error:', error)
          set({ user: null, isAuthenticated: false })
          return false
        }
      },

      updateProfile: async (data) => {
        try {
          const success = await authService.updateProfile(data)
          if (success) {
            const user = authService.getCurrentUserFromStorage()
            set({ user })
          }
          return success
        } catch (error) {
          console.error('Update profile error:', error)
          return false
        }
      },

      checkPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        return authService.hasPermission(permission)
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get()
        if (!user) return false
        return authService.hasAnyPermission(permissions)
      },

      canCreateMore: (recordType: string, currentCount: number) => {
        const { user } = get()
        if (!user) return false
        return authService.canCreateMore(recordType, currentCount)
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      refreshUserInfo: async () => {
        try {
          const updatedUser = await authService.getCurrentUser()
          if (updatedUser) {
            set({ user: updatedUser })
            return true
          }
          return false
        } catch (error) {
          console.error('Refresh user info error:', error)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)