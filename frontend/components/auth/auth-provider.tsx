'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/types/simulation'

// Mock mode - set to true when Django backend is not available
const USE_MOCK_AUTH = true

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user storage key
const MOCK_USER_KEY = 'silent_path_mock_user'
const MOCK_USERS_KEY = 'silent_path_mock_users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock auth - check localStorage
        const storedUser = localStorage.getItem(MOCK_USER_KEY)
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          setUser(null)
        }
      } else {
        // Real auth - call API
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (username: string, password: string) => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock login
        const storedUsers = localStorage.getItem(MOCK_USERS_KEY)
        const users: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []
        
        const foundUser = users.find(u => u.username === username && u.password === password)
        
        if (foundUser) {
          const userWithoutPassword: User = {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
          }
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(userWithoutPassword))
          setUser(userWithoutPassword)
          return { success: true }
        } else {
          return { success: false, error: 'Invalid username or password' }
        }
      } else {
        // Real login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        const data = await response.json()
        if (response.ok) {
          setUser(data.user)
          return { success: true }
        } else {
          return { success: false, error: data.error || 'Login failed' }
        }
      }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock register
        const storedUsers = localStorage.getItem(MOCK_USERS_KEY)
        const users: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []
        
        // Check if user exists
        if (users.find(u => u.username === username || u.email === email)) {
          return { success: false, error: 'Username or email already exists' }
        }
        
        const newUser = {
          id: Date.now(),
          username,
          email,
          password,
        }
        
        users.push(newUser)
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
        
        const userWithoutPassword: User = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        }
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(userWithoutPassword))
        setUser(userWithoutPassword)
        return { success: true }
      } else {
        // Real register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        })
        const data = await response.json()
        if (response.ok) {
          setUser(data.user)
          return { success: true }
        } else {
          return { success: false, error: data.error || 'Registration failed' }
        }
      }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        localStorage.removeItem(MOCK_USER_KEY)
      } else {
        await fetch('/api/auth/logout', { method: 'POST' })
      }
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
